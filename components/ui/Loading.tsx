import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

const Loading = ({ size = "large", color = Colors.primary }) => {
  return (
    <View className="justify-center items-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({});
