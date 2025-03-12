import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MailIconProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

function MailIcon({
  onPress,
  size = 24,
  color = "#000000",
  height,
  width,
  strokeWidth,
  ...props
}: MailIconProps) {
  // Use height/width if provided, otherwise use size
  const iconSize = height || width || size;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Ionicons name="mail-outline" size={iconSize} color={color} />
    </TouchableOpacity>
  );
}

export default MailIcon;
