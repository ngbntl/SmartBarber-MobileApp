import React from "react";
import { TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";

interface LockIconProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

function CheckIcon({
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
      <Entypo name="check" size={iconSize} color={color} />
    </TouchableOpacity>
  );
}

export default CheckIcon;
