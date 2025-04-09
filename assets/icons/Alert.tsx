import React from "react";
import { TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";

interface LockIconProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

function AlertIcon({
  onPress,
  size = 24,
  color = "#000000",
  height,
  width,
  strokeWidth,
  ...props
}: LockIconProps) {
  const iconSize = height || width || size;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Feather name="alert-triangle" size={iconSize} color={color} />
    </TouchableOpacity>
  );
}

export default AlertIcon;
