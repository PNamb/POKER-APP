import {
    createGame,
    advancePhase,
    validate,
    applyAction
} from "../game/game-engine"
import {toPublicState} from "./networkState"
import {
    MessageType,
    ErrorCode,
    makeMessage,
    makeErrorMessage,
    isValidMessage
} from "./protocol"

const ROOM_CODE_LENGTH = 6;
const CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const HOST_CONNECTION_ID = "host"

function generateRoomCode() {
  //generates random 6-character code
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)];
  }
  return code;
}

export class HostSession {
    //sendToConnection: (connectionId, message) => void
    constructor({sendToConnection, hostName = "Host"}) {
        this.sendToConnection = sendToConnection
        this.roomCode = generateRoomCode()
        this.state = null //null until startGame() is called
        this.started = false

        //each roster entry: {connectionID, name, isBot, botID}
        this.roster = [{connectionID: "host", name: hostName, isBot: false}]
        this.nextBotNumber = 1

        //Maps connection ID to playerIndex
        this.connectionToPlayerIndex = new Map()

        //Maps playerIndex to connection ID
        this.playerIndexToConnection = new Map()

        //called whenever this.state changes; meant for host
        this._onStateChange = null

        //called whenevr the roster changes; meant for host
        this._onRosterChange = null

        //called when the host playerIndex is known
        this._onGameStarted = null

        this._onError = null
    }

    setOnStateChange(fn) {
        this._onStateChange = fn
    }

    setOnRosterChange(fn) {
        this._onRosterChange = fn
    }

    setOnGameStarted(fn) {
        this._onGameStarted = fn
        const hostPlayerIndex = this.connectionToPlayerIndex.get(HOST_CONNECTION_ID)
        if (this.started && hostPlayerIndex !== undefined) {
            fn({playerIndex: hostPlayerIndex})
        }
    }

    setOnError(fn) {
        this._onError = fn
    }

    handleJoinRequest(connectionID, {name}) {
        if (this.started) {
            return this._sendError(connectionID, ErrorCode.GAME_ALREADY_STARTED, "Game has already started")
        }

        const trimmed = (name ?? "").trim()
        if (trimmed.length === 0) {
            return this._sendError(connectionID, ErrorCode.INTERNAL_ERROR, "Name is too short")
        }

        if (this.roster.some((p) => p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
            return this._sendError(connectionID, ErrorCode.NAME_TAKEN, "Name is already taken")
        }

        this.roster.push({connectionID, name: trimmed, isBot: false})

        this.sendToConnection(connectionID, makeMessage(MessageType.JOIN_ACCEPTED, {roomCode: this.roomCode}))

        this._broadcastRoster()
    }

    handleAddBotRequest() {
        if (this.started) return
        const botID = `bot-${this.nextBotNumber++}`
        this.roster.push({connectionID: null, name: `Bot ${this.nextBotNumber - 1}`, isBot: true, botID})
        this._broadcastRoster()
    }

    handleRemoveBotRequest(botID) {
        if (this.started) return
        this.roster = this.roster.filter((p) => p.botID !== botID)
        this._broadcastRoster()
    }

    handleLeave(connectionID) {
        if (!this.started) {
            this.roster = this.roster.filter((p) => p.connectionID !== connectionID)
            this._broadcastRoster()
            return
        }

        //mid-game leave: mark disconnected, so the playerIndex states stay valid
        const playerIndex = this.connectionToPlayerIndex.get(connectionID)
        if (playerIndex === undefined) return

        this.state = {
            ...this.state,
            players: this.state.players.map((p, i) => i === playerIndex ? {...p, connected: false} : p)
        }

        this._broadcastState()
        this._broadcastToAllExcept(connectionID, makeMessage(MessageType.PLAYER_LEFT, {playerIndex}))
    }

    startGame({startingChips = 500, bigBlind = 20} = {}) {
        if (this.started) return
        this.started = true

        const playerNames = this.roster.map((p) => p.name)
        let game = createGame(playerNames, {
            startingChips,
            bigBlind,
            smallBlind: bigBlind ? Math.floor(bigBlind / 2) : undefined
        })

        game = {
            ...game,
            players: game.players.map((p, i) => ({
                ...p, 
                isBot: this.roster[i].isBot
            }))
        }

        this.roster.forEach((entry, i) => {
            if(entry.isBot) return //bots have no connection
            this.connectionToPlayerIndex.set(entry.connectionID, i)
            this.playerIndexToConnection.set(i, entry.connectionID)

            if (entry.connectionID !== "host") {
                this.sendToConnection(entry.connectionID, makeMessage(MessageType.GAME_STARTED, {playerIndex: i}))
            }
        })

        this.state = advancePhase({...game, phase: "waiting"})

        const hostPlayerIndex = this.connectionToPlayerIndex.get(HOST_CONNECTION_ID)
        if (hostPlayerIndex !== undefined) {
            this._onGameStarted?.({playerIndex: hostPlayerIndex})
        }
        this._broadcastState()
    }

    handleActionRequest(connectionID, {action}) {
        const playerIndex = this.connectionToPlayerIndex.get(connectionID)

        if (playerIndex === undefined) {
            return this._sendError(connectionID, ErrorCode.UNKNOWN_PLAYER, "You are not a player in this game")
        }
        if (!this.state) {
            return this._sendError(connectionID, ErrorCode.INTERNAL_ERROR, "Game has not started yet")
        }

        try {
            validate(this.state, playerIndex, action)
            this.state = applyAction(this.state, playerIndex, action)
            this._broadcastState()
        } catch (e) {
            this._sendError(connectionID, ErrorCode.ILLEGAL_ACTION, e.message)
        }
    }

    handleBotAction(playerIndex, action) {
        if (!this.state) return false
        const player = this.state.players[playerIndex]
        if (!player?.isBot) return false
        
        try {
            validate(this.state, playerIndex, action)
            this.state = applyAction(this.state, playerIndex, action)
            this._broadcastState()
            return true
        } catch (e) {
            console.warn("[HostSession] bot action rejected", playerIndex, action, e.message)
            return false
        }
    }

    handleNextHandRequest(connectionID) {
        const playerIndex = this.connectionToPlayerIndex.get(connectionID)

        if (playerIndex === undefined) {
            return this._sendError(connectionID, ErrorCode.UNKNOWN_PLAYER, "You are not a player in this game")
        }

        if (!this.state || this.state.phase !== "showdown") return

        this.state = advancePhase({...this.state, phase: "waiting"})
        this._broadcastState()
    }

    handleMessage(connectionID, message) {
        if (!isValidMessage(message)) {
            return this._sendError(connectionID, ErrorCode.INTERNAL_ERROR, "Bad message")
        }
        switch (message.type) {
            case MessageType.JOIN_REQUEST:
                return this.handleJoinRequest(connectionID, message.payload);
            case MessageType.ACTION_REQUEST:
                return this.handleActionRequest(connectionID, message.payload);
            case MessageType.NEXT_HAND_REQUEST:
                return this.handleNextHandRequest(connectionID);
            case MessageType.ADD_BOT_REQUEST:
                return this.handleAddBotRequest();
            case MessageType.REMOVE_BOT_REQUEST:
                return this.handleRemoveBotRequest(message.payload.botID);
            case MessageType.LEAVE:
                return this.handleLeave(connectionID)
            case MessageType.PING:
                return this.sendToConnection(connectionID, makeMessage(MessageType.PONG, {}))
            default:
                return this._sendError(connectionID, ErrorCode.INTERNAL_ERROR, `Unhandled message type: ${message.type}`)
        }
    }

    _sendError(connectionID, code, message) {
        if (connectionID === HOST_CONNECTION_ID) {
            this._onError?.({code, message})
            return
        }
        this.sendToConnection(connectionID, makeErrorMessage(code, message))
    }

    _broadcastRoster() {
        const payload = {
            players: this.roster.map((p) => ({
                name: p.name,
                isBot: p.isBot,
                botID: p.botID ?? null,
                isHost: p.connectionID == "host"
            })),
            roomCode: this.roomCode
        }
        this._onRosterChange?.(payload)
        this._broadcastToAll(makeMessage(MessageType.ROSTER_UPDATE, payload))
    }

    _broadcastState() {
        this._onStateChange?.(this.state)

        for (const [playerIndex, connectionID] of this.playerIndexToConnection) {
            if (connectionID === "host") continue
            const publicState = toPublicState(this.state, playerIndex)
            this.sendToConnection(connectionID, makeMessage(MessageType.STATE_UPDATE, {state: publicState}))
        }
    }

    _broadcastToAll(message) {
        for (const entry of this.roster) {
            if (entry.isBot || entry.connectionID === "host") continue
            this.sendToConnection(entry.connectionID, message)
        }
    }

    _broadcastToAllExcept(connectionID, message) {
        for (const entry of this.roster) {
            if (entry.isBot || entry.connectionID === "host" || entry.connectionID === connectionID) continue
            this.sendToConnection(entry.connectionID, message)
        }
    }
}