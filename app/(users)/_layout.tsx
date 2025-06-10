import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTranslation } from "react-i18next";

export default function UsersTabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: "#FFFFFF",
            elevation: 0,
            shadowOpacity: 0.1,
            height: 70,
            paddingBottom: 10,
          },
          android: {
            backgroundColor: "#FFFFFF",
            elevation: 8,
            height: 70,
            paddingBottom: 10,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("navigation.home"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t("navigation.bookings"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hairTryOn"
        options={{
          title: t("navigation.hairTryOn"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "camera-reverse" : "camera-reverse-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("navigation.account"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="serviceDetail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
