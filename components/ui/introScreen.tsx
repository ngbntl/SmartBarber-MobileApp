import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

const IntroScreen = () => {
  const router = useRouter();
  const opacity = useSharedValue(1);

  const fadeOutNavigate = () => {
    opacity.value = 0;
    setTimeout(() => {
      //   router.replace("/onboardingScreen");
      console.log("onboardingScreen");
    }, 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fadeOutNavigate();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>Intro Screen</Text>
    </Animated.View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
