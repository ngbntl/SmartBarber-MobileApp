import { View, Text } from "react-native";
import React from "react";
import IntroScreen from "@/components/ui/IntroScreen";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "@/global.css";
const index = () => {
  return (
    <View className="flex flex-1 justify-center">
      <IntroScreen
        onFinish={() => {
          AsyncStorage.getItem("isOnboarded").then((isOnboarded) => {
            if (isOnboarded) {
              router.replace("/(auth)/login");
            } else {
              router.replace("/onboardingScreen");
            }
          });
        }}
      />
    </View>
  );
};

export default index;
