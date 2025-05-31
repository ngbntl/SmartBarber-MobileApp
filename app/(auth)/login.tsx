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
  Alert,
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
import { SignInInterface } from "@/types/auth";
import { useDispatch } from "react-redux";
import { login, setUserInfo } from "@/store/authSlice";
import { useNotification } from "@/hooks/useNotification";
import Toast from "@/components/ui/Toast";
import { useTranslation } from "react-i18next";
import { saveTokens } from "@/utils/secureStore";
import UserApi from "@/api/userApi";

const { height } = Dimensions.get("window");

const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { appNotification, toast, setToast } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError(t("auth.login.email_empty"));
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t("auth.login.email_invalid"));
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError(t("auth.login.password_empty"));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t("auth.login.password_short"));
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const authApi = new AuthApi();
      const loginData: SignInInterface = {
        email,
        password,
      };
      const response = await authApi.login(loginData);
      if (response) {
        const accessToken = response.accessToken || "";
        const refreshToken = response.refreshToken || "";

        await saveTokens(accessToken, refreshToken);

        dispatch(
          login({
            username: email,
            accessToken: accessToken,
          })
        );

        try {
          const userApi = new UserApi();
          const userInfo = await userApi.getUserInfo();

          if (userInfo) {
            dispatch(setUserInfo(userInfo));
            const userRole = userInfo.roleType;
            if (userRole === "system_admin") {
              // router.replace("/(admin)");
            } else if (userRole === "system_stylist") {
              router.replace("/(stylists)");
            } else if (userRole === "system_user") {
              router.replace("/(users)");
            }
          }
        } catch (userError) {
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      appNotification(error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <TouchableOpacity
        activeOpacity={1}
        onPress={dismissKeyboard}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={{
            height: headerHeight,
            backgroundColor: Colors.primary,
          }}
        >
          <SafeAreaView className="items-center justify-center flex-1">
            <Animated.View
              style={{
                transform: [
                  { scale: logoScale },
                  { translateY: logoTranslateY },
                ],
                opacity: headerOpacity,
                alignItems: "center",
              }}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-28 h-28"
                resizeMode="contain"
                style={{
                  shadowColor: "white",
                  shadowRadius: 10,
                  shadowOpacity: 0.3,
                }}
              />
              {!keyboardOpen && (
                <Text className="text-white text-2xl font-bold mt-2 text-center shadow-md">
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
                  {t("auth.login.title")}
                </Text>
                <Text className="text-lg text-gray-500">
                  {t("auth.login.description")}
                </Text>
              </View>

              <Input
                placeholder={t("auth.login.email")}
                icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                containerStyle="mb-1"
                error={emailError}
              />
              {emailError && (
                <Text className="text-red-500 text-xs  ml-1">{emailError}</Text>
              )}

              <Input
                placeholder={t("auth.login.password")}
                icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                containerStyle="mb-1"
                rightContent={
                  <Show
                    isVisible={showPassword}
                    size={26}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                }
                error={passwordError}
              />
              {passwordError && (
                <Text className="text-red-500 text-xs mb-3 ml-1">
                  {passwordError}
                </Text>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.replace("/(auth)/forgotPassword")}
              >
                <Text className="text-primary text-right font-medium my-3">
                  {t("auth.login.forgotPassword")}
                </Text>
              </TouchableOpacity>

              <Button
                title={t("auth.signIn")}
                loading={isLoading}
                onPress={handleLogin}
              />

              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-500">
                  {t("auth.login.noAccount")}{" "}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text className="text-primary font-bold">
                    {t("auth.signUp")}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
