import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
// import { User } from "@/store/authSlice";
import { useRouter } from "expo-router";
import { useState } from "react";
import { AppDispatch } from "@/store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  //   const handleLogin = async () => {
  //     const result = await dispatch(User({ email, password }));
  //     if (User.fulfilled.match(result)) {
  //       router.replace("/(tabs)"); // Chuyển hướng đến màn hình chính sau khi đăng nhập
  //     }
  //   };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Login</Text>
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
        // onPress={handleLogin}
      >
        <Text className="text-white font-semibold text-center">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
