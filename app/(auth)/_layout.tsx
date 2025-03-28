import React from "react";
import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";

/**
 *  Auth Navigation Layout
 * @description Manages screen transitions and styling for Authentication process
 */
export default function AuthLayout() {
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
        name="import-wallet"
        options={{
          headerShown: false,
          title: "Import Wallet",
          presentation: "card",
        }}
      />

      <Stack.Screen
        name="create-wallet"
        options={{
          headerShown: false,
          title: "Create Wallet",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
