import React from "react";
import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { AppProvider } from "@/contexts/AppContext";
import { StatusBar } from "react-native";
import { NetworkSessionProvider } from "@/contexts/NetworkSessionContext";

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
        <Stack.Screen name="temp" />
        <Stack.Screen name = "guide" />
        <Stack.Screen name = "settings" />
        <Stack.Screen name = "profile" />
        <Stack.Screen name = "network_test" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <NetworkSessionProvider>
      <AppProvider>
        <LayoutInner />
      </AppProvider>
    </NetworkSessionProvider>
    
  );
}
