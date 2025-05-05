import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { ButtonInterface } from "@/types/button";
import { Colors } from "@/constants/Colors";
import Loading from "@/components/ui/Loading";

const Button = (button: ButtonInterface) => {
  const {
    buttonStyle,
    hasShadow,
    title,
    textStyles,
    onPress,
    loading = false,
  } = button;
  const shadowStyle = {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, hasShadow && shadowStyle]}
      className=" justify-center items-center rounded-lg bg-primary"
      onPress={onPress}
    >
      <Text
        style={[styles.text, textStyles]}
        className="text-lg text-white font-bold "
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    borderCurve: "continuous",
    height: 50,
    borderRadius: 8,
  },
  text: {},
});
