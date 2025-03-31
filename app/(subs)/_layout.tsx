import React from "react";
import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";

/**
 * Onboarding Navigation Layout
 * @description Manages screen transitions and styling for onboarding process
 */
export default function SubLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.dark.background,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitle: "Back",
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="subs"
        options={{
          headerShown: false,
          presentation: "card",
          title: "Add Token",
        }}
      />
    </Stack>
  );
}
