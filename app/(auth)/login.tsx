import {
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Keyboard,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import Button from "@/components/button/Button";
import Input from "@/components/input/Input";
import { useRouter } from "expo-router";
import Icon from "@/assets/icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import Show from "@/assets/icons/Show";

const { height } = Dimensions.get("window");

const Login = () => {
  const router = useRouter();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const headerHeight = useRef(new Animated.Value(height * 0.4)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardOpen(true);

        const keyboardHeight = event.endCoordinates.height;

        Animated.parallel([
          Animated.timing(headerHeight, {
            toValue: height * 0.15,
            duration: 250,
            useNativeDriver: false,
          }),

          Animated.timing(logoTranslateY, {
            toValue: -20,
            duration: 250,
            useNativeDriver: true,
          }),

          Animated.timing(logoScale, {
            toValue: 0.7,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardOpen(false);

        Animated.parallel([
          Animated.timing(headerHeight, {
            toValue: height * 0.4,
            duration: 250,
            useNativeDriver: false,
          }),

          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),

          Animated.timing(logoScale, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={dismissKeyboard}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />

      <Animated.View
        style={{
          height: headerHeight,
          backgroundColor: Colors.primary,
        }}
      >
        <SafeAreaView className="items-center justify-center flex-1">
          <Animated.View
            style={{
              transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
              opacity: headerOpacity,
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-24 h-24"
              resizeMode="contain"
            />
            {!keyboardOpen && (
              <Text className="text-white text-xl font-bold mt-2 text-center">
                Smart Barber
              </Text>
            )}
          </Animated.View>
        </SafeAreaView>
      </Animated.View>

      <View className="bg-white flex-1 rounded-t-3xl -mt-6">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            }}
          >
            <View className="gap-6 mb-6">
              <Text className="text-4xl font-bold text-primary">
                Welcome Back 👋
              </Text>
              <Text className="text-lg text-gray-500">
                Please login to continue
              </Text>
            </View>

            <Input
              placeholder="Enter your email"
              icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
              keyboardType="email-address"
              onChangeText={(value) => (emailRef.current = value)}
              containerStyle="mb-4"
            />

            <Input
              placeholder="Enter your password"
              icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
              secureTextEntry={!showPassword}
              onChangeText={(value) => (passwordRef.current = value)}
              containerStyle="mb-2"
              rightContent={
                <Show
                  isVisible={showPassword}
                  size={26}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace("/(auth)/otpConfirm")}
            >
              <Text className="text-primary text-right font-medium mb-6">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button title="Login" loading={isLoading} onPress={() => {}} />

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500">Don't have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(auth)/register")}
              >
                <Text className="text-primary font-bold">Register</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
};

export default Login;
