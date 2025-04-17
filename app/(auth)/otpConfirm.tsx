import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@/assets/icons";
import { Colors } from "@/constants/Colors";
import Button from "@/components/button/Button";
import { useNotification } from "@/hooks/useNotification";
import AuthApi from "@/api/auth";
import { VerifyEmailInterface } from "@/types/auth";
import Toast from "@/components/ui/Toast";
import { useTranslation } from "react-i18next";

const OTP_LENGTH = 6;

export default function OTPConfirmScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { appNotification, toast, setToast } = useNotification();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    startCountdown();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      const otpArray = text.split("").slice(0, OTP_LENGTH);
      const newOtp = [...otp];

      otpArray.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      const lastIndex = Math.min(index + otpArray.length - 1, OTP_LENGTH - 1);
      inputRefs.current[lastIndex]?.focus();

      if (newOtp.every((digit) => digit !== "")) {
        setTimeout(() => {
          handleVerify(newOtp);
        }, 300);
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === OTP_LENGTH - 1 && text) {
      if (newOtp.every((digit) => digit !== "")) {
        setTimeout(() => {
          handleVerify(newOtp);
        }, 300);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      const newOtp = [...otp];

      if (!otp[index] && index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async (otpArray = otp) => {
    const hasEmptyFields = otpArray.some((digit) => digit === "");
    if (hasEmptyFields) {
      appNotification({
        statusCode: 400,
        message: t("otp.otp_ishort"),
      });
      return;
    }
    setIsLoading(true);
    try {
      const authApi = new AuthApi();
      const otpString = otpArray.join("");
      const verifyEmailData: VerifyEmailInterface = {
        email: email,
        otpCode: otpString,
      };
      console.log(verifyEmailData);
      const response = await authApi.verifyEmail(verifyEmailData);
      if (response === true) {
        appNotification({
          statusCode: 200,
          message: t("otp.verifySuccess"),
        });
        router.replace("/(auth)/login");
      } else {
        appNotification(response);
      }
    } catch (error: any) {
      appNotification(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setCountdown(60);
    setCanResend(false);
    startCountdown();

    setIsLoading(true);
    try {
      const authApi = new AuthApi();
      await authApi.resendOTP({ email });
    } catch (error: any) {
      appNotification(error);
      setCanResend(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="backArrow" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t("otp.title")}</Text>
          <Text style={styles.subtitle}>
            {t("otp.description")} {email}
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref as TextInput)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus={false}
                autoComplete="off"
                autoCorrect={false}
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>{t("otp.receive")}</Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={!canResend || isLoading}
            >
              <Text
                style={[
                  styles.resendButton,
                  (!canResend || isLoading) && styles.resendButtonDisabled,
                ]}
              >
                {canResend && !isLoading
                  ? t("otp.resendOtp")
                  : `${t("otp.resendOtp_after")} ${countdown}s`}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={t("otp.verify")}
            loading={isLoading}
            disabled={isLoading}
            onPress={handleVerify}
            buttonStyle={styles.button}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
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
    marginBottom: 32,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  resendText: {
    color: "#666",
  },
  resendButton: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  resendButtonDisabled: {
    color: "#999",
  },
  button: {
    marginTop: 16,
  },
});
