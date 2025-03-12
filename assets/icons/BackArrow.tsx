import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BackArrowProps {
  onPress?: () => void;
  size?: number;
  color?: string;
}

function BackArrow({ onPress, size = 24, color = "#000000" }: BackArrowProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  );
}

export default BackArrow;
