import {
    MessageType,
    ErrorCode,
    makeMessage,
    isValidMessage
} from "./protocol"

export class ClientSession {
    constructor({sendToHost, playerName}) {
        this.sendToHost = sendToHost
        this.playerName = playerName

        this.playerIndex = null
        this.roomCode = null
        this.joined = false
        this.started = false

        this.roster = [] //[{name, isBot, botID, isHost}]
        this.state = null //most recent state passed from host
        this.lastError = null //{code, message} - most recent error

        this._onStateChange = null //called whenever state changes
        this._onRosterChange = null //called whenever roster changes
        this._onJoinAccepted = null //called whenever a join request is accepted
        this._onJoinRejected = null //called whenever a join request is rejected
        this._onGameStarted = null //called when the game starts

        this._onError = null //called whenever an error message is recieved
        this._onPlayerLeft = null //called whenever a player leaves mid-game
    }

    setOnStateChange(fn) {
        this._onStateChange = fn
        if (this.state) {
            fn(this.state)
        }
    }

    setOnRosterChange(fn) {
        this._onRosterChange = fn
    }

    setOnJoinAccepted(fn) {
        this._onJoinAccepted = fn
    }

    setOnJoinRejected(fn) {
        this._onJoinRejected = fn
    }

    setOnGameStarted(fn) {
        this._onGameStarted = fn
        if (this.started && this.playerIndex !== null) {
            fn({playerIndex: this.playerIndex})
        }
    }

    setOnError(fn) {
        this._onError = fn
    }

    setOnPlayerLeft(fn) {
        this._onPlayerLeft = fn
    }

    //Sending to Host

    join() {
        this.sendToHost(makeMessage(MessageType.JOIN_REQUEST, {name: this.playerName}))
    }

    sendAction(action) {
        if(!this.joined) return
        this.sendToHost(makeMessage(MessageType.ACTION_REQUEST, {action}))
    }

    requestNextHand() {
        if (!this.joined) return
        this.sendToHost(makeMessage(MessageType.NEXT_HAND_REQUEST, {}))
    }

    requestAddBot() {
        if (!this.joined) return
        this.sendToHost(makeMessage(MessageType.ADD_BOT_REQUEST, {}))
    }

    requestRemoveBot(botID) {
        if (!this.joined) return
        this.sendToHost(makeMessage(MessageType.REMOVE_BOT_REQUEST, {botID: botID}))
    }

    leave() {
        if (!this.joined) return
        this.sendToHost(makeMessage(MessageType.LEAVE, {}))
        this.joined = false
    }

    ping() {
        this.sendToHost(makeMessage(MessageType.PING, {}))
    }

    //Receiving from Host

    handleMessage(message) {
        if (!isValidMessage(message)) return

        switch (message.type) {
            case MessageType.JOIN_ACCEPTED:
                return this._handleJoinAccepted(message.payload)
            case MessageType.JOIN_REJECTED:
                return this._handleJoinRejected(message.payload)
            case MessageType.ROSTER_UPDATE:
                return this._handleRosterUpdate(message.payload)
            case MessageType.STATE_UPDATE:
                return this._handleStateUpdate(message.payload)
            case MessageType.GAME_STARTED:
                return this._handleGameStarted(message.payload)
            case MessageType.ERROR:
                return this._handleError(message.payload)
            case MessageType.PLAYER_LEFT:
                return this._handlePlayerLeft(message.payload)
            case MessageType.PONG:
                return
            default:
                return
        }
    }

    _handleJoinAccepted({roomCode}) {
        this.joined = true
        this.roomCode = roomCode
        this._onJoinAccepted?.({roomCode})
    }

    _handleJoinRejected({reason}) {
        this.joined = false
        this._onJoinRejected?.({reason})
    }

    _handleRosterUpdate(payload) {
        this.roster = payload.players
        this.roomCode = payload.roomCode ?? this.roomCode
        this._onRosterChange?.({players: this.roster, roomCode: this.roomCode})
    }

    _handleStateUpdate({state}) {
        this.state = state
        this._onStateChange?.(state)
    }

    _handleGameStarted({playerIndex}) {
        this.started = true
        this.playerIndex = playerIndex
        this._onGameStarted?.({playerIndex})
    }

    _handleError(payload) {
        this.lastError = payload
        this._onError?.(payload)
    }

    _handlePlayerLeft({playerIndex}) {
        this._onPlayerLeft?.(playerIndex)
    }
}