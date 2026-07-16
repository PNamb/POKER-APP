import React from "react";
import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { MusicProvider } from "@/contexts/MusicContext";
import { StatusBar } from "react-native";

function LayoutInner() {
  useBackgroundMusic();
  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background.table },
          animation: "none",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="join" />
        <Stack.Screen name="lobby" />
        <Stack.Screen name="game" />
        <Stack.Screen name = "guide" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <MusicProvider>
      <LayoutInner />
    </MusicProvider>
  );
}
