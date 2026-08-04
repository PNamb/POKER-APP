import { useState, useCallback, useEffect, useRef, use } from "react";
import {
  createBotGame,
  advancePhase,
  applyAction,
  getLegalActions,
} from "../game/game-engine";
import { botAction } from "../game/bot-ai";
import { useApp } from "@/contexts/AppContext";

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
  session,
  hostSession,
  isHost = "false",
}) {
  const { botDifficulty, recordHandResult } = useApp();
  const [state, setState] = useState(null);
  const [localPlayerIndex, setLocalPlayerIndex] = useState(0);
  const botTimeoutRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionRef = useRef(null);
  const recordedHandRef = useRef(null);

  const lastReceivedStateRef = useRef(null);

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

  const commitReceivedState = useCallback(
    (state) => {
      const prev = lastReceivedStateRef.current;
      lastReceivedStateRef.current = state;
      commitState(prev, state);
    },
    [commitState]
  );

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
      if (!session) return;

      const handleStateUpdate = (state) => {
        commitReceivedState(state);
      };

      const handleGameStarted = ({ playerIndex }) => {
        setLocalPlayerIndex(playerIndex);
      };

      session.setOnStateChange?.(handleStateUpdate);
      session.setOnGameStarted?.(handleGameStarted);

      if (!session.joined && typeof session.joined === "function") {
        session.join();
      }
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
        session?.sendAction(action);
      }
    },
    [mode, state, localPlayerIndex, commitState, session]
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

  const onlineBotTimeoutRef = useRef(null);
  useEffect(() => {
    if (mode !== "online" || !isHost || !hostSession) return;
    if (!state || isTransitioning) return;
    if (state.phase === "waiting" || state.phase === "showdown") return;

    const activePlayer = state.players[state.activeIndex];
    if (!activePlayer?.isBot) return;

    const actingIndex = state.activeIndex;

    onlineBotTimeoutRef.current = setTimeout(() => {
      const current = hostSession.state;

      if (!current || current.activeIndex !== actingIndex) return;

      const action = botAction(current, actingIndex, botDifficulty);
      hostSession.handleBotAction(actingIndex, action);
    }, BOT_ACTION_DELAY);

    return () => clearTimeout(onlineBotTimeoutRef.current);
  }, [mode, isHost, hostSession, state, isTransitioning, botDifficulty]);

  useEffect(() => {
    if (!state || state.phase !== "showdown" || !state.winners) return;
    if (recordedHandRef.current === state.handNumber) return;

    recordedHandRef.current = state.handNumber;

    const localWinnings = state.winners
      .filter((w) => w.playerIndex === localPlayerIndex)
      .reduce((sum, w) => sum + w.amount, 0);

    recordHandResult(localWinnings > 0, localWinnings);
  }, [state, localPlayerIndex, recordHandResult]);

  const legalActions = state ? getLegalActions(state, localPlayerIndex) : null;
  const isLocalPlayerTurn =
    state?.activeIndex === localPlayerIndex &&
    !state?.players[localPlayerIndex].folded;

  const startNextHand = useCallback(() => {
    if (mode === "bot") {
      const next = advancePhase({ ...state, phase: "waiting" });
      commitState(state, next);
    }
    if (mode === "online") {
      session?.requestNextHand();
    }
  }, [mode, state, commitState, session]);

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
