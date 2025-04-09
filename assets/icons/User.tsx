import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UserIconProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

function UserIcon({
  onPress,
  size = 24,
  color = "#000000",
  height,
  width,
  strokeWidth,
  ...props
}: UserIconProps) {
  const iconSize = height || width || size;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Ionicons name="person-outline" size={iconSize} color={color} />
    </TouchableOpacity>
  );
}

export default UserIcon;
