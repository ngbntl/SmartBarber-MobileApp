import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import React, { ReactNode } from "react";
import { Colors } from "@/constants/Colors";

interface InputProps {
  icon?: ReactNode;
  rightContent?: ReactNode;
  containerStyle?: string;
  containerStyles?: any;
  inputRef?: any;
  [key: string]: any;
}

const Input = ({
  icon,
  rightContent,
  containerStyle,
  containerStyles,
  inputRef,
  ...props
}: InputProps) => {
  return (
    <View
      style={[styles.container, containerStyles]}
      className={containerStyle}
    >
      {icon && <View>{icon}</View>}

      <TextInput
        className={`
        text-base rounded-lg flex-1
        ${Platform.OS === "ios" ? "py-3" : "py-2"} 
        ${Platform.OS === "android" ? "h-12" : "h-11"}
      `}
        placeholderTextColor={Colors.primary}
        ref={inputRef}
        {...props}
      />

      {rightContent && rightContent}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    padding: 10,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    borderColor: Colors.primary,
    borderCurve: "continuous",
    gap: 10,
    borderRadius: 12,
  },
});
