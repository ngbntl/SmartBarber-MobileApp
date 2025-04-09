import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Colors";
import Icon from "@/assets/icons";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 0,
        duration: duration,
        useNativeDriver: false,
      }),
    ]).start(() => {
      handleClose();
    });
  }, [opacity, progress, duration]);

  const handleClose = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#E8F5E9";
      case "error":
        return "#FFEBEE";
      case "warning":
        return "#FFF3E0";
      default:
        return "#E3F2FD";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "warning":
        return "#FF9800";
      default:
        return "#2196F3";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "#1B5E20";
      case "error":
        return "#B71C1C";
      case "warning":
        return "#E65100";
      default:
        return "#0D47A1";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Icon name="check" size={20} color={getIconColor()} />;
      case "error":
        return <Icon name="close" size={20} color={getIconColor()} />;
      case "warning":
        return <Icon name="alert" size={20} color={getIconColor()} />;
      default:
        return <Icon name="info" size={20} color={getIconColor()} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: getBackgroundColor(),
          transform: [
            {
              translateY: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
        <TouchableOpacity onPress={handleClose}>
          <Icon name="close" size={20} color={getTextColor()} />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: getTextColor(),
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  progressBar: {
    height: 3,
    position: "absolute",
    bottom: 0,
    left: 0,
    borderRadius: 3,
  },
});

export default Toast;
