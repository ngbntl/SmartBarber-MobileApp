import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, Text, Image } from "react-native";
import React, { useEffect } from "react";

const IntroScreen = ({ onFinish }: { onFinish: () => void }) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
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
      <Image
        source={require("@/assets/images/logo.png")}
        style={[styles.img]}
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
    backgroundColor: "#211C84",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  img: {
    width: 30,
    height: 30,
  },
});
