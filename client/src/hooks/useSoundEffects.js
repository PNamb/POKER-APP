import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useRef } from "react";

const SOUNDS = {
  deal: require("@/assets/sounds/deal.wav"),
  chip: require("@/assets/sounds/chip.wav"),
  fold: require("@/assets/sounds/fold.wav"),
  check: require("@/assets/sounds/check.wav"),
  win: require("@/assets/sounds/win.wav"),
  turn: require("@/assets/sounds/deal.wav"),
};

export function useSoundEffects(state) {
  const players = {
    deal: useAudioPlayer(SOUNDS.deal),
    chip: useAudioPlayer(SOUNDS.chip),
    fold: useAudioPlayer(SOUNDS.fold),
    check: useAudioPlayer(SOUNDS.check),
    win: useAudioPlayer(SOUNDS.win),
    turn: useAudioPlayer(SOUNDS.turn),
  };

  const play = useCallback(
    (key) => {
      //audio driver
      const p = players[key];
      if (!p) return;
      p.seekTo(0);
      p.play();
    },
    [
      players.deal,
      players.chip,
      players.fold,
      players.check,
      players.win,
      players.turn,
    ]
  ); //play a sound if anything happens

  const lastActionRef = useRef(null);
  useEffect(() => {
    //audio-player for action buttons
    const action = state?.lastAction;
    if (!action || action === lastActionRef.current) return;
    lastActionRef.current = action;

    if (action.type === "fold") play("fold");
    else if (action.type === "check") play("check");
    else if (action.type === "call" || action.type === "raise") play("chip");
  }, [state?.lastAction]); //run if lastAction changes

  const phaseRef = useRef(null);
  useEffect(() => {
    //audio-player for phase changes
    if (!state || state.phase === phaseRef.current) return;
    phaseRef.current = state.phase;

    if (["preflop", "flop", "turn", "river"].includes(state.phase))
      play("deal");
    if (state.phase === "showdown") play("win");
  }, [state?.phase]); //run if phase changes

  return { play };
}
