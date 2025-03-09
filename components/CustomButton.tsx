import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
} from "react-native";
import React from "react";
import { router } from "expo-router";

const CustomButton = ({ flatListRef, flatListIndex, dataLength }) => {
  const buttonAnimationStyle = useAnimatedStyle(() => {
    return {
      width:
        flatListIndex.value === dataLength - 1
          ? withSpring(140)
          : withSpring(60),
      height: 60,
    };
  });
  const arrowAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity:
        flatListIndex.value === dataLength - 1 ? withTiming(0) : withTiming(1),
      transform: [
        {
          translateX:
            flatListIndex.value === dataLength - 1
              ? withTiming(100)
              : withTiming(0),
        },
      ],
    };
  });
  const textAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity:
        flatListIndex.value === dataLength - 1 ? withTiming(1) : withTiming(0),
      transform: [
        {
          translateX:
            flatListIndex.value === dataLength - 1
              ? withTiming(0)
              : withTiming(-100),
        },
      ],
    };
  });
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (flatListIndex.value < dataLength - 1) {
          flatListRef.current.scrollToIndex({
            index: flatListIndex.value + 1,
            animated: true,
          });
        } else {
          router.replace("/(auth)/login");
        }
      }}
    >
      <Animated.View style={[styles.container, buttonAnimationStyle]}>
        <Animated.Text style={[styles.textButton, textAnimationStyle]}>
          Get started
        </Animated.Text>
        <Animated.Image
          source={require("@/assets/images/arrow-icon.png")}
          style={[styles.arrow, arrowAnimationStyle]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "orange",
    borderRadius: 100,
    overflow: "hidden",
    padding: 10,
  },
  arrow: {
    position: "absolute",
    width: 30,
    height: 30,
  },

  textButton: {
    color: "white",
    fontSize: 16,
    marginRight: 10,
  },
});
