import { useState, useCallback, useEffect, useRef } from "react";
import {
  createBotGame,
  advancePhase,
  applyAction,
  getLegalActions,
} from "../game/game-engine";
import { botAction } from "../game/bot-ai";
import { useMusic } from "@/contexts/MusicContext";

const BOT_ACTION_DELAY = 200; //ms
const REVEAL_DELAY = 100; //ms
const ACTION_SETTLE_DELAY = 150; //ms

export function useGameState({
  mode,
  numBots,
  roomCode,
  playerName,
  startingChips = 500,
  bigBlind = 20,
}) {
  const { botDifficulty } = useMusic()
  const [state, setState] = useState(null);
  const [localPlayerIndex, setLocalPlayerIndex] = useState(0);
  const botTimeoutRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionRef = useRef(null);

  const commitState = useCallback((prevState, nextState) => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }

    const phaseChanged = prevState && nextState.phase !== prevState.phase;

    if (!phaseChanged) {
      setState(nextState);
      return;
    }

    const actingIndex = nextState.lastAction?.playerIndex;
    const actingPlayerNext = nextState.players.find(
      (_, i) => i === actingIndex
    );

    const frozenPlayers = prevState.players.map((p, i) => {
      if (i !== actingIndex) return p;
      const nextP = nextState.players[i];
      const spent = p.chips - nextP.chips; //however much they put in this action
      return {
        ...p,
        bet: p.bet + spent,
        chips: nextP.chips,
        allIn: nextP.allIn,
      };
    });

    setState({
      ...prevState,
      players: frozenPlayers,
      pot: prevState.pot,
      lastAction: nextState.lastAction,
    });
    setIsTransitioning(true);

    transitionRef.current = setTimeout(() => {
      setState(nextState);
      setIsTransitioning(false);
    }, REVEAL_DELAY + ACTION_SETTLE_DELAY);
  }, []);

  useEffect(() => {
    if (mode === "bot") {
      const game = createBotGame(playerName || "You", numBots, {
        startingChips,
        bigBlind,
        smallBlind: bigBlind ? Math.floor(bigBlind / 2) : undefined,
      }); //3 bots by default
      setState(advancePhase({ ...game, phase: "waiting" })); //start first hand
      setLocalPlayerIndex(0);
    }

    if (mode === "online") {
      //TODO - replace with real state sync via socket-client.js
    }

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, [mode, numBots]);

  const performAction = useCallback(
    (action) => {
      if (mode === "bot") {
        const next = applyAction(state, localPlayerIndex, action);
        commitState(state, next);
        return;
      }

      if (mode === "online") {
        //TODO - send action to host via socket-client.js
      }
    },
    [mode, state, localPlayerIndex, commitState]
  );

  const onFold = useCallback(
    () => performAction({ type: "fold" }),
    [performAction]
  );
  const onCheck = useCallback(
    () => performAction({ type: "check" }),
    [performAction]
  );
  const onCall = useCallback(
    () => performAction({ type: "call" }),
    [performAction]
  );
  const onRaise = useCallback(
    (amount) => performAction({ type: "raise", amount }),
    [performAction]
  );

  useEffect(() => {
    if (mode !== "bot" || !state || isTransitioning) return;
    if (state.phase === "waiting" || state.phase === "showdown") return;

    const activePlayer = state.players[state.activeIndex];
    if (!activePlayer?.isBot) return;

    botTimeoutRef.current = setTimeout(() => {
      const action = botAction(state, state.activeIndex, botDifficulty);
      const next = applyAction(state, state.activeIndex, action);
      commitState(state, next);
    }, BOT_ACTION_DELAY);

    return () => clearTimeout(botTimeoutRef.current);
  }, [mode, state, isTransitioning, commitState, botDifficulty]);

  const legalActions = state ? getLegalActions(state, localPlayerIndex) : null;
  const isLocalPlayerTurn =
    state?.activeIndex === localPlayerIndex &&
    !state?.players[localPlayerIndex].folded;

  const startNextHand = useCallback(() => {
    if (mode === "bot") {
      const next = advancePhase({ ...state, phase: "waiting" });
      commitState(state, next);
    }
  }, [mode, state, commitState]);

  return {
    state,
    localPlayerIndex,
    legalActions,
    isLocalPlayerTurn: isLocalPlayerTurn && !isTransitioning,
    isTransitioning,
    onFold,
    onCheck,
    onCall,
    onRaise,
    startNextHand,
  };
}
