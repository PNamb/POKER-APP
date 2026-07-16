import React, { createContext, useContext, useState } from "react";

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [muted, setMuted] = useState(false);

  const toggleMute = () => setMuted((m) => !m);

  return (
    <MusicContext.Provider value={{ muted, toggleMute }}>
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
