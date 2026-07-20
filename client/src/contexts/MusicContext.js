import React, { createContext, useContext, useState } from "react";

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [musicVolume, setMusicVolume] = useState(0.3)
  const [sfxVolume, setSfxVolume] = useState(1)
  const [fourColorDeck, setFourColorDeck] = useState(false)
  const [botDifficulty, setBotDifficulty] = useState("medium") //"easy" | "medium" | "hard" | "random"

  const muted = musicVolume === 0
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(0.3)

  const toggleMute = () => {
    if (muted) {
      setMusicVolume(volumeBeforeMute || 0.3)
    } else {
      setVolumeBeforeMute(musicVolume)
      setMusicVolume(0)
    }
  }

  return (
    <MusicContext.Provider 
      value = {{ 
        musicVolume,
        setMusicVolume,
        sfxVolume,
        setSfxVolume,
        fourColorDeck,
        setFourColorDeck,
        botDifficulty,
        setBotDifficulty,
        muted,
        toggleMute
        }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error("Need a MusicProvider");
  }
  return ctx;
}
