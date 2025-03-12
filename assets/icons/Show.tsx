import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ShowProps {
  onToggle: () => void;
  isVisible: boolean;
  size?: number;
  color?: string;
  containerStyle?: string;
}

const Show = ({
  onToggle,
  isVisible,
  size = 24,
  color = "#777777",
  containerStyle = "pr-2",
}: ShowProps) => {
  return (
    <TouchableOpacity onPress={onToggle} className={containerStyle}>
      <Ionicons
        name={isVisible ? "eye-outline" : "eye-off-outline"}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
};

export default Show;
