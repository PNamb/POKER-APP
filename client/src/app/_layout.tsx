import React from "react";
import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background.table },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="join" />
      <Stack.Screen name="lobby" />
      <Stack.Screen name="game" />
    </Stack>
  );
}
