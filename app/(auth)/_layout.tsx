import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-2xl font-bold">Auth Layout</Text>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </View>
    </>
  );
}
