import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { View, Text, StyleSheet } from "react-native";
import React, { memo } from "react";

const Pagination = ({ data, x, screenWidth }) => {
  const PaginationComp = memo(({ i }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const widthAnimation = interpolate(
        x.value,
        [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
        [10, 20, 10],
        Extrapolate.CLAMP
      );
      const opacityAnimation = interpolate(
        x.value,
        [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );
      return {
        width: widthAnimation,
        opacity: opacityAnimation,
      };
    });

    return <Animated.View style={[styles.dots, animatedDotStyle]} />;
  });

  return (
    <View style={styles.container}>
      {data.map((_, i) => (
        <PaginationComp i={i} key={i} />
      ))}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  dots: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "orange",
    marginHorizontal: 5,
  },
});
