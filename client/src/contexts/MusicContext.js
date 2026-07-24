import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"

const MusicContext = createContext(null);
const STORAGE_KEY = "@poker_settings"

const DEFAULT_SETTINGS = {
  musicVolume: 0.3,
  sfxVolume: 1,
  fourColorDeck: false,
  botDifficulty: "medium",
  hapticLevel: "Light",
  displayName: "",
  handsPlayed: 0,
  handsWon: 0,
  biggestPot: 0
}

export function MusicProvider({ children }) {
  const [musicVolume, setMusicVolume] = useState(DEFAULT_SETTINGS.musicVolume)
  const [sfxVolume, setSfxVolume] = useState(DEFAULT_SETTINGS.sfxVolume)
  const [fourColorDeck, setFourColorDeck] = useState(DEFAULT_SETTINGS.fourColorDeck)
  const [botDifficulty, setBotDifficulty] = useState(DEFAULT_SETTINGS.botDifficulty) //"easy" | "medium" | "hard" | "random"
  const [hapticLevel, setHapticLevel] = useState(DEFAULT_SETTINGS.hapticLevel) //"Light" | "Medium" | "Heavy"

  const [displayName, setDisplayName] = useState(DEFAULT_SETTINGS.displayName)
  const [handsPlayed, setHandsPlayed] = useState(DEFAULT_SETTINGS.handsPlayed)
  const [handsWon, setHandsWon] = useState(DEFAULT_SETTINGS.handsWon)
  const [biggestPot, setBiggestPot] = useState(DEFAULT_SETTINGS.biggestPot)

  const [isLoaded, setIsLoaded] = useState(false)

  const muted = musicVolume === 0
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(DEFAULT_SETTINGS.musicVolume)

  const latestRef = useRef({
    musicVolume, sfxVolume, fourColorDeck, botDifficulty, hapticLevel, displayName, handsPlayed, handsWon, biggestPot
  })

  useEffect(() => {
    latestRef.current = {
      musicVolume, sfxVolume, fourColorDeck, botDifficulty, hapticLevel, displayName, handsPlayed, handsWon, biggestPot
    }
  }, [musicVolume, sfxVolume, fourColorDeck, botDifficulty, hapticLevel, displayName, handsPlayed, handsWon, biggestPot])

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved.musicVolume !== undefined) {
            setMusicVolume(saved.musicVolume)
            setVolumeBeforeMute(saved.musicVolume || DEFAULT_SETTINGS.musicVolume)
          }
          if (saved.sfxVolume !== undefined) setSfxVolume(saved.sfxVolume)
          if (saved.fourColorDeck !== undefined) setFourColorDeck(saved.fourColorDeck)
          if (saved.botDifficulty !== undefined) setBotDifficulty(saved.botDifficulty)
          if (saved.hapticLevel !== undefined) setHapticLevel(saved.hapticLevel)
          if (saved.displayName !== undefined) setDisplayName(saved.displayName)
          if (saved.handsPlayed !== undefined) setHandsPlayed(saved.handsPlayed)
          if (saved.handsWon !== undefined) setHandsWon(saved.handsWon)
          if (saved.biggestPot !== undefined) setBiggestPot(saved.biggestPot)
        }
      } catch (e) {
        console.warn("Failed to load settings", e)
      } finally {
        setIsLoaded(true)
      }
    })()
  }, [])

  const persist = useCallback(() => {
    if (!isLoaded) return
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(latestRef.current)).catch((e) => console.warn("Failed to save settings", e))
  }, [isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    persist()
  }, [fourColorDeck, botDifficulty, hapticLevel, displayName, handsPlayed, handsWon, biggestPot, persist])


  const toggleMute = () => {
    if (muted) {
      setMusicVolume(volumeBeforeMute || DEFAULT_SETTINGS.musicVolume)
    } else {
      setVolumeBeforeMute(musicVolume)
      setMusicVolume(0)
    }
    setTimeout(persist, 0)
  }

  const recordHandResult = useCallback((won, amount = 0) => {
    setHandsPlayed((n) => n + 1)
    if (won) {
      setHandsWon((n) => n + 1)
      setBiggestPot((prev) => Math.max(prev, amount))
    }
  }, [])

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
        hapticLevel,
        setHapticLevel,
        muted,
        toggleMute,

        displayName,
        setDisplayName,
        handsPlayed,
        setHandsPlayed,
        handsWon,
        setHandsWon,
        biggestPot,
        recordHandResult,

        isLoaded,

        persistVolumeSettings: persist,
        commitName: persist
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
