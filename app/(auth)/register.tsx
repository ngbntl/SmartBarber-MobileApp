import {
  Text,
  View,
  Image,
  TouchableOpacity,
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
import AuthApi from "@/api/auth";
import { RegisterInterface } from "@/types/auth";
import { useDispatch } from "react-redux";
import Toast from "@/components/ui/Toast";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();
  const { appNotification, toast, setToast } = useNotification();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const headerHeight = useRef(new Animated.Value(height * 0.35)).current;
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

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!firstName.trim()) {
      setFirstNameError(t("auth.register.firstName_empty"));
      isValid = false;
    }

    if (!lastName.trim()) {
      setLastNameError(t("auth.register.lastName_empty"));
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError(t("auth.register.email_empty"));
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t("auth.register.email_invalid"));
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError(t("auth.register.password_empty"));
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(t("auth.register.password_short"));
      isValid = false;
    } else {
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        setPasswordError(t("auth.register.password_invalid"));
        isValid = false;
      }
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t("auth.register.confirmPassword_empty"));
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t("auth.register.password_match"));
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const authApi = new AuthApi();
      const registerData: RegisterInterface = {
        firstName,
        lastName,
        email,
        password,
      };
      console.log("registerData", registerData);
      const response = await authApi.register(registerData);

      if (response) {
        appNotification(response);
        setTimeout(() => {
          router.replace(
            `/(auth)/otpConfirm?email=${encodeURIComponent(email)}`
          );
        }, 1500);
      } else {
        appNotification(response);
      }
    } catch (error) {
      appNotification(error, _error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={dismissKeyboard}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
                {t("common.smartBarber")}
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
            <View className="gap-3">
              <Text className="text-4xl font-bold text-primary">
                {t("auth.register.title")}
              </Text>
              <Text className="text-lg text-gray-500">
                {t("auth.register.description")}
              </Text>
            </View>

            <View className="flex-row gap-4 -mb-1">
              <View className="flex-1">
                <Input
                  placeholder={t("auth.register.firstName")}
                  icon={<Icon name="user" size={24} strokeWidth={1.6} />}
                  value={firstName}
                  onChangeText={setFirstName}
                  error={firstNameError}
                />
                {firstNameError && (
                  <Text className="text-red-500 text-xs ml-1 -mt-2">
                    {firstNameError}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Input
                  placeholder={t("auth.register.lastName")}
                  icon={<Icon name="user" size={24} strokeWidth={1.6} />}
                  value={lastName}
                  onChangeText={setLastName}
                  error={lastNameError}
                />
                {lastNameError && (
                  <Text className="text-red-500 text-xs ml-1 -mt-2">
                    {lastNameError}
                  </Text>
                )}
              </View>
            </View>

            <Input
              placeholder={t("auth.register.email")}
              icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              containerStyle="mb-1"
              error={emailError}
            />
            {emailError && (
              <Text className="text-red-500 text-xs ml-1">{emailError}</Text>
            )}

            <Input
              placeholder={t("auth.register.password")}
              icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              containerStyle="mb-1"
              error={passwordError}
              rightContent={
                <Show
                  isVisible={showPassword}
                  size={26}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              }
            />
            {passwordError && (
              <Text className="text-red-500 text-xs ml-1">{passwordError}</Text>
            )}

            <Input
              placeholder={t("auth.register.confirmPassword")}
              icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              containerStyle="mb-1"
              error={confirmPasswordError}
              rightContent={
                <Show
                  isVisible={showConfirmPassword}
                  size={26}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
            {confirmPasswordError && (
              <Text className="text-red-500 text-xs ml-1">
                {confirmPasswordError}
              </Text>
            )}
            <Button
              title={t("auth.register.register")}
              loading={isLoading}
              onPress={handleRegister}
              buttonStyle={{
                marginTop: 10,
              }}
            />

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500">
                {t("auth.register.haveAccount")}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text className="text-primary font-bold">
                  {t("auth.register.login")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}
