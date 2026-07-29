import { MessageType, makeMessage } from "./protocol";

const HOST_CONNECTION_ID = "host"

export class HostSessionAdapter {
    constructor(hostSession) {
        this.hostSession = hostSession

        this.joined = true

        this._onStateChange = null
        this._onRosterChange = null
        
        this.hostSession.setOnStateChange((state) => {
            this._onStateChange?.(state)
        })

        this.hostSession.setOnRosterChange((payload) => {
            this._onRosterChange?.(payload)
        })
    }

    join() {
        
    }

    sendAction(action) {
        this.hostSession.handleMessage(
            HOST_CONNECTION_ID,
            makeMessage(MessageType.ACTION_REQUEST, {action})
        )
    }

    requestNextHand() {
        this.hostSession.handleMessage(
            HOST_CONNECTION_ID,
            makeMessage(MessageType.NEXT_HAND_REQUEST, {})
        )
    }

    requestAddBot() {
        this.hostSession.handleMessage(
            HOST_CONNECTION_ID,
            makeMessage(MessageType.ADD_BOT_REQUEST, {})
        )
    }

    requestRemoveBot(botID) {
        this.hostSession.handleMessage(
            HOST_CONNECTION_ID,
            makeMessage(MessageType.REMOVE_BOT_REQUEST, {botID: botID})
        )
    }

    leave() {
        this.hostSession.handleMessage(
            HOST_CONNECTION_ID,
            makeMessage(MessageType.LEAVE, {})
        )
    }

    setOnStateChange(fn) {
        this._onStateChange = fn
        if (this.hostSession.state) {
            fn(this.hostSession.state)
        }
    }

    setOnRosterChange(fn) {
        this._onRosterChange = fn
    }

    setOnGameStarted(fn) {
        this.hostSession.setOnGameStarted(fn)
    }

    setOnError(fn) {
        this.hostSession.setOnError(fn)
    }

}