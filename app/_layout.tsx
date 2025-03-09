import { Stack, useRouter, useSegments } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "@/store";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import "@/global.css";
import IntroScreen from "@/components/ui/IntroScreen";

function LayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isIntro, setIsIntro] = useState(true);

  const handleIntroFinish = () => {
    setIsIntro(false);
  };

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboarded = await AsyncStorage.getItem("onboarded");
        setIsOnboarded(onboarded === "false");
      } catch (error) {
        console.error("Lỗi kiểm tra onboarding:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isLoading || isOnboarded === null || isIntro) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!isOnboarded) {
        router.replace("/onboardingScreen");
      } else if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isLoading, isOnboarded, user, isIntro]);

  if (isIntro) {
    return <IntroScreen onFinish={handleIntroFinish} />;
  }

  if (isLoading || isOnboarded === null) {
    return (
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName="loading"
      />
    );
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LayoutContent />
      </PersistGate>
    </Provider>
  );
}
