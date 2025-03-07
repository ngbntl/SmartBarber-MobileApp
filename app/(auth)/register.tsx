import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Register</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 w-full mb-4"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3 w-full mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3 w-full mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="mt-6 bg-blue-500 px-6 py-3 rounded-lg w-full"
        onPress={() => console.log("Register")}
      >
        <Text className="text-white font-semibold text-center">Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text className="text-blue-500 mt-4">
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  );
}
