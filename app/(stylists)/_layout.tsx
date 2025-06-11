import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { useNotificationCount } from "@/hooks/useNotificationCount";

export default function StylistLayout() {
  const { t } = useTranslation();
  const { unreadCount } = useNotificationCount();
  
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
        name="schedule"
        options={{
          title: t("navigation.schedule"),
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
        name="clients"
        options={{
          title: t("navigation.clients"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
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
      
      {/* Hide this screen from the tab bar */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
