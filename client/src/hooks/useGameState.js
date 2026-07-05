import { useState, useCallback, useEffect, useRef } from "react"
import { createBotGame, advancePhase, applyAction, getLegalActions } from "../game/game-engine"
import { botAction } from "../game/bot-ai"

const BOT_ACTION_DELAY = 900 //ms

export function useGameState({ mode, roomCode, playerName }) {
    const [state, setState] = useState(null)
    const [localPlayerIndex, setLocalPlayerIndex] = useState(0)
    const botTimeoutRef = useRef(null)

    useEffect(() => {
        if (mode === "bot") {
            const game = createBotGame(playerName || "You", 3) //3 bots by default
            setState(advancePhase({...game, phase: "waiting"})) //start first hand
            setLocalPlayerIndex(0)
        }

        if (mode === "online") {
            //TODO - replace with real state sync via socket-client.js
        }

        return () => {
            if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current)
        }
    }, [mode])

    const performAction = useCallback((action) => {
        if (mode === "bot") {
            setState((prev) => applyAction(prev, localPlayerIndex, action))
            return
        }

        if (mode === "online") {
            //TODO - send action to host via socket-client.js
        }
    }, [mode, localPlayerIndex])

    const onFold = useCallback(() => performAction({type: "fold"}), [performAction])
    const onCheck = useCallback(() => performAction({type: "check"}), [performAction])
    const onCall = useCallback(() => performAction({type: "call"}), [performAction])
    const onRaise = useCallback((amount) => performAction({type: "raise", amount}), [performAction])

    useEffect(() => {
        if (mode !== "bot" || !state) return
        if (state.phase === "waiting" || state.phase === "showdown") return

        const activePlayer = state.players[state.activeIndex]
        if (!activePlayer?.isBot) return

        botTimeoutRef.current = setTimeout(() => {
            const action = botAction(state, state.activeIndex)
            setState((prev) => applyAction(prev, state.activeIndex, action))
        }, BOT_ACTION_DELAY)

        return () => clearTimeout(botTimeoutRef.current)
    }, [mode, state])

    const legalActions = state ? getLegalActions(state, localPlayerIndex) : null
    const isLocalPlayerTurn = state?.activeIndex === localPlayerIndex && !state?.players[localPlayerIndex].folded

    const startNextHand = useCallback(() => {
        if (mode === "bot") {
            setState((prev) => advancePhase({...prev, phase: "waiting"}))
        }
        //TODO - online mode: host triggers next hand via socket-client.js

    }, [mode])

    return {
        state,
        localPlayerIndex,
        legalActions,
        isLocalPlayerTurn,
        onFold,
        onCheck,
        onCall,
        onRaise,
        startNextHand
    }
}