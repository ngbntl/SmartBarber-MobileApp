import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
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

const OTP_LENGTH = 6;

export default function OTPConfirmScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { appNotification } = useNotification();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      const otpArray = text.split("").slice(0, OTP_LENGTH);
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (i < OTP_LENGTH) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(otpArray.length, OTP_LENGTH - 1)]?.focus();
      if (otpArray.length === OTP_LENGTH) {
        handleVerify();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === OTP_LENGTH - 1 && text) {
      const otpString = [...newOtp].join("");
      if (otpString.length === OTP_LENGTH) {
        handleVerify();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      appNotification({
        statusCode: 400,
        message: "Vui lòng nhập đủ 6 chữ số OTP",
      });
      return;
    }

    setIsLoading(true);
    try {
      const authApi = new AuthApi();
      const verifyEmailData: VerifyEmailInterface = {
        email: email,
        otpCode: otpString,
      };
      const response = await authApi.verifyEmail(verifyEmailData);
      appNotification({
        statusCode: response.statusCode,
        message: response.message,
      });
      if (response.statusCode === 200) {
        router.replace("/(auth)/login");
      }
    } catch (error: any) {
      appNotification({
        statusCode: error.statusCode || 500,
        message: error.message || "Có lỗi xảy ra, vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      const authApi = new AuthApi();
      const response = await authApi.resendOTP({ email });
      appNotification({
        statusCode: response.statusCode,
        message: response.message,
      });
      if (response.statusCode === 200) {
        setCountdown(60);
        setCanResend(false);

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      appNotification({
        statusCode: error.statusCode || 500,
        message: error.message || "Có lỗi xảy ra, vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="backArrow" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Xác nhận OTP</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập mã OTP 6 chữ số đã được gửi đến email {email}
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
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Không nhận được mã? </Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={!canResend || isLoading}
            >
              <Text
                style={[
                  styles.resendButton,
                  !canResend && styles.resendButtonDisabled,
                ]}
              >
                {canResend ? "Gửi lại" : `Gửi lại sau ${countdown}s`}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Xác nhận"
            loading={isLoading}
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
