import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import Icon from "@/assets/icons";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
  position?: "top" | "bottom";
}

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
  position = "top",
}: ToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(
    new Animated.Value(position === "top" ? -100 : 100)
  ).current;
  const progress = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusBarHeight = StatusBar.currentHeight || 0;

  useEffect(() => {
    // Show toast
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Start progress bar
    Animated.timing(progress, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Auto dismiss after duration
    timeoutRef.current = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration]);

  const handleClose = () => {
    // Clear timeout if closing manually
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Hide toast with animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === "top" ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call the onClose callback after animation completes
      if (onClose) {
        onClose();
      }
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
      // return <Icon name="info" size={20} color={getIconColor()} />;
    }
  };

  const getToastPosition = () => {
    if (position === "bottom") {
      return {
        top: undefined,
        bottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
      };
    } else {
      const safeTopMargin = Math.max(insets.top, statusBarHeight);
      return {
        top: safeTopMargin + 10,
        bottom: undefined,
      };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY }],
          ...getToastPosition(),
        },
      ]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text
          style={[styles.message, { color: getTextColor() }]}
          numberOfLines={2}
        >
          {message}
        </Text>
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: width * 0.05,
    width: width * 0.9,
    padding: 12,
    borderRadius: 8,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
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
