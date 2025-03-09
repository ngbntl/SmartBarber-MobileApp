import { Slot, useRouter } from "expo-router";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store, persistor, RootState } from "@/store";
import "@/global.css";

import IntroScreen from "@/components/ui/IntroScreen";
import Loading from "@/components/ui/Loading";

function LayoutContent() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboarded = await AsyncStorage.getItem("onboarded");
        setIsOnboarded(onboarded === "true");
      } catch (error) {
        console.error("Lỗi kiểm tra onboarding:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isOnboarded) {
      router.replace("/onboardingScreen");
    } else if (!user) {
      router.replace("/(auth)/login");
    } else {
      router.replace("/(tabs)");
    }
  }, [isLoading, isOnboarded, user]);

  if (showIntro) {
    return <IntroScreen onFinish={() => setShowIntro(false)} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <LayoutContent />
      </PersistGate>
    </Provider>
  );
}
