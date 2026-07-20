import { useAudioPlayer } from "expo-audio";
import { usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useMusic } from "@/contexts/MusicContext";

const LOBBY_MUSIC = require("@/assets/sounds/lobby.mp3");
const GAME_MUSIC = require("@/assets/sounds/game_music.mp3");

export function useBackgroundMusic() {
  const { musicVolume } = useMusic(false);
  const pathname = usePathname();
  const isGameScreen = pathname === "/game";

  const lobbyPlayer = useAudioPlayer(LOBBY_MUSIC);
  const gamePlayer = useAudioPlayer(GAME_MUSIC);

  lobbyPlayer.volume = musicVolume * 0.3;
  gamePlayer.volume = musicVolume * 0.1;

  useEffect(() => {
    lobbyPlayer.loop = true;
    gamePlayer.loop = true;
  }, [lobbyPlayer, gamePlayer]);

  const wasGameScreen = useRef(isGameScreen);

  useEffect(() => {
    if (isGameScreen === wasGameScreen.current) return;
    wasGameScreen.current = isGameScreen;

    if (isGameScreen) {
      //if the new screen is the game-screen, stop currently playing music and start game-screen music
      lobbyPlayer.pause();
      gamePlayer.seekTo(0);
      gamePlayer.play();
    } else {
      //if the new screen is the lobby-screen, stop currently playing music and start lobby-screen music
      gamePlayer.pause();
      lobbyPlayer.seekTo(0);
      lobbyPlayer.play();
    }
  }, [isGameScreen]); //run if a screen is changed

  useEffect(() => {
    lobbyPlayer.play();
  }, []); //run once when opening the game
}
