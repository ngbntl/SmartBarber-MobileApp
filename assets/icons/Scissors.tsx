import React from "react";
import { TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";

interface ScissorsIcon {
  onPress?: () => void;
  size?: number;
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

function ScissorsIcon({
  onPress,
  size = 24,
  color = "#000000",
  height,
  width,
  strokeWidth,
  ...props
}: ScissorsIcon) {
  const iconSize = height || width || size;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Entypo name="scissors" size={iconSize} color={color} />
    </TouchableOpacity>
  );
}

export default ScissorsIcon;
