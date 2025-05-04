import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "@/constants/Colors";

const IntroScreen = ({ onFinish }: { onFinish: () => void }) => {
  const opacity = useSharedValue(1);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Play Lottie animation
    if (lottieRef.current) {
      lottieRef.current.play();
    }

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 });

      setTimeout(() => {
        onFinish();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LottieView
        ref={lottieRef}
        source={require("@/assets/lottie/Barber Sign.json")}
        style={styles.lottie}
        autoPlay={false}
        loop={false}
      />
    </Animated.View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  lottie: {
    width: 250,
    height: 250,
  },
});
