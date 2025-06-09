import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Keyboard,
  Image,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import Button from "@/components/button/Button";
import Input from "@/components/input/Input";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@/assets/icons";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "@/hooks/useLanguage";

const ForgotPassword = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleResetPassword = () => {
    setError("");
    if (!email.trim()) {
      setError(t("auth.login.email_empty"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t("auth.login.email_invalid"));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/(auth)/otpConfirm");
    }, 1500);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={Keyboard.dismiss}
      style={styles.container}
    >
      <StatusBar style="dark" />

      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="backArrow" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            },
          ]}
        >
          <Image
            source={require("@/assets/images/forgot-pass.png")}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.textContainer}>
            <Text style={styles.title}>{t("auth.forgotPassword.title")}</Text>
            <Text style={styles.subtitle}>
              {t("auth.forgotPassword.subtitle")}
            </Text>
          </View>

          <Input
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            icon={<Icon name="mail" size={26} color="#666" />}
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            error={error}
            containerStyle="mb-2"
            autoCapitalize="none"
            className="{{error ? 'border-red-500' : ''}}"
          />
          {error ? <Text className="text-red-500 mb-3">{error}</Text> : null}

          <Button
            title={t("auth.forgotPassword.sendButton")}
            loading={isLoading}
            onPress={handleResetPassword}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t("auth.login.haveAccount")}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.footerLink}>{t("common.login")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </TouchableOpacity>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 24,
  },
  textContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  button: {
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666",
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
