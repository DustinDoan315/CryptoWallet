import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomTabBar({ state, navigation, descriptors }: any) {
  const insets = useSafeAreaInsets();

  const orderedRoutes = [];

  const indexRoute = state.routes.find((r: any) => r.name === "index");
  const exchangeRoute = state.routes.find((r: any) => r.name === "exchange");
  const walletRoute = state.routes.find((r: any) => r.name === "wallet");

  if (indexRoute) orderedRoutes.push(indexRoute);
  if (exchangeRoute) orderedRoutes.push(exchangeRoute);
  if (walletRoute) orderedRoutes.push(walletRoute);

  console.log(
    "Ordered routes:",
    orderedRoutes.map((r) => r.name)
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {orderedRoutes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isActive = state.index === state.routes.indexOf(route);

        const label = options.title || route.name;

        let iconName;
        let activeIconName;

        if (route.name === "index") {
          iconName = "home-outline";
          activeIconName = "home";
        } else if (route.name === "wallet") {
          iconName = "wallet-outline";
          activeIconName = "wallet";
        } else if (route.name === "exchange") {
          iconName = "swap-horizontal";
          activeIconName = "swap-horizontal";
        }

        const isCenter = index === 1;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          return (
            <View key={route.key} style={styles.centerButtonContainer}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isActive ? { selected: true } : {}}
                accessibilityLabel={label}
                onPress={onPress}
                style={styles.centerButton}>
                <Ionicons
                  name={isActive ? activeIconName : iconName}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
              <Text style={styles.tabText}>{label}</Text>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isActive ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.tabButton}>
            <Ionicons
              name={isActive ? activeIconName : iconName}
              size={24}
              color={isActive ? "#3498db" : "#FFFFFF"}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "OKX",
        }}
      />
      <Tabs.Screen
        name="exchange"
        options={{
          title: "Giao dịch",
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Tài sản",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: "center",
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    bottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: "#FFFFFF",
  },
  activeTabText: {
    color: "#3498db",
  },
});
