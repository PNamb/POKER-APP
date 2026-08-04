import React, {createContext, useContext, useState, useCallback, useRef, useEffect} from "react";
import {HostSession} from "../network/HostSession"
import { HostSessionAdapter } from "../network/HostSessionAdapter";
import { ClientSession } from "../network/ClientSession";
import {hostRoom, joinRoom} from "../network/signaling"

function generateClientID() {
    return `client-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

const NetworkSessionContext = createContext(null)

export function NetworkSessionProvider({children}) {
    const [role, setRole] = useState(null) //"host" | "client" | null

    const [hostSession, setHostSession] = useState(null)
    const [session, setSession] = useState(null)

    const channelsRef = useRef(new Map())
    const peerConnectionsRef = useRef(new Map()) //clientID -> RTCPeerConnection

    const signalingStopRef = useRef(null)

    //start hosting a new game
    const startHosting = useCallback(async ({hostName, startingChips, bigBlind}) => {
        console.log("!!!!! startHosting CALLED !!!!!")

        const closeConnection = (connectionID) => {
            const channel = channelsRef.current.get(connectionID)
            try {
                channel?.close()
            } catch (e) {
                console.warn("[NetworkSession] can't close channel", connectionID, e)
            }
            channelsRef.current.delete(connectionID)

            const pc = peerConnectionsRef.current.get(connectionID)
            try {
                pc?.close()
            } catch (e) {
                console.warn("[NetworkSession] can't close peer connection", connectionID, e)
            }

            peerConnectionsRef.current.delete(connectionID)
        }


        const newHostSession = new HostSession({
            sendToConnection: (connectionID, message) => {
                const channel = channelsRef.current.get(connectionID)
                if (!channel || channel.readyState !== "open") {
                    console.warn("[NetworkSession] no open channel for", connectionID, message)
                    return
                }
                channel.send(JSON.stringify(message))
            }, closeConnection, hostName, startingChips, bigBlind,
        })
        const adapter = new HostSessionAdapter(newHostSession)
        
        setHostSession(newHostSession)
        setSession(adapter)
        setRole("host")

        const {stop} = await hostRoom(newHostSession.roomCode, {
            onJoinerConnected: ({clientID, channel, pc}) => {
                channelsRef.current.set(clientID, channel)
                if (pc) peerConnectionsRef.current.set(clientID, pc)

                channel.addEventListener("message", (event) => {
                    try {
                        const message = JSON.parse(event.data)
                        newHostSession.handleMessage(clientID, message)
                    } catch (error) {
                        console.warn("[NetworkSession] failed to parse message from", clientID)
                    }
                })

                channel.addEventListener("close", () => {
                    channelsRef.current.delete(clientID)
                    peerConnectionsRef.current.delete(clientID)
                    newHostSession.handleLeave(clientID)
                })
            },
            onJoinerFailed: ({clientID, error}) => {
                console.warn("[NetworkSession] joiner negotiation failed", clientID, error)
            },
            onJoinerDisconnected: ({clientID, reason}) => {
                console.warn("[NetworkSession] joiner disconnected", clientID, reason)
                channelsRef.current.delete(clientID)
                peerConnectionsRef.current.delete(clientID)
                newHostSession.handleDisconnect(clientID)
            }
        })

        signalingStopRef.current = stop

        return newHostSession
    }, [])

    //joins an existing session
    const startJoining = useCallback(async ({playerName, roomCode}) => {
        const clientID = generateClientID()

        const newClientSession = new ClientSession({
            sendToHost: (message) => {
                const channel = channelsRef.current.get("host");
                if (!channel || channel.readyState !== "open") {
                    console.warn("[NetworkSession] no open channel to host - dropping message", message);
                    return;
                }
                channel.send(JSON.stringify(message));
            },
            playerName,
        });

        setHostSession(null)
        setSession(newClientSession)
        setRole("client")

        const {stop} = await joinRoom(roomCode, clientID, {
            onConnected: ({channel, pc}) => {
                channelsRef.current.set("host", channel)

                if (pc) peerConnectionsRef.current.set("host", pc)

                channel.addEventListener("message", (event) => {
                    try {
                        const message = JSON.parse(event.data)
                        newClientSession.handleMessage(message)
                    } catch (error) {
                        console.warn("[NetworkSession] failed to parse message from host", error);
                    }
                })

                newClientSession.join()
            },
            onFailed: ({error}) => {
                console.warn("[NetworkSession] failed to connect to Host", error)
                newClientSession._onJoinRejected?.({reason: "connection_failed"})
            },
            onDisconnected: ({reason}) => {
                console.warn("[Network Session] disconnected from host", reason)
                channelsRef.current.delete("host")
                peerConnectionsRef.current.delete("host")
                newClientSession._onGameEnded?.({reason: "host_disconnected"})
            }
        })

        signalingStopRef.current = stop

        return newClientSession
    }, [])

    const sessionRef = useRef(session)
    useEffect(() => {sessionRef.current = session}, [session])

    const hostSessionRef = useRef(hostSession)
    useEffect(() => {hostSessionRef.current = hostSession}, [hostSession])

    const endSession = useCallback(() => {
        hostSessionRef.current?.closeAllConnections()

        sessionRef.current?.leave()
        signalingStopRef.current?.()
        signalingStopRef.current = null
        channelsRef.current.clear()
        peerConnectionsRef.current.clear()
        setHostSession(null)
        setSession(null)
        setRole(null)
    }, [])

    return (
        <NetworkSessionContext.Provider
            value = {{
                role,
                hostSession,
                session,
                startHosting,
                startJoining,
                endSession
            }}
        >
            {children}
        </NetworkSessionContext.Provider>
    )
}

export function useNetworkSession() {
    const ctx = useContext(NetworkSessionContext)
    if (!ctx) {
        throw new Error("Need a NetworkSessionProvider")
    }
    return ctx
}