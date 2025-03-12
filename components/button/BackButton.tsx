import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import Icon from "@/assets/icons";
import { Colors } from "@/constants/Colors";

type BackButtonProps = {
  size?: number;
  router: any;
};

const BackButton: React.FC<BackButtonProps> = ({ size = 26, router }) => {
  return (
    <Pressable
      className="rounded-full"
      onPress={() => router.back()}
      style={styles.button}
    >
      <Icon
        name="backArrow"
        strokeWidth={2.5}
        color={Colors.primary}
        size={size}
      />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
  },
});
