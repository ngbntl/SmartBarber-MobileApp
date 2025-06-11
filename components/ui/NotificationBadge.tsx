import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface NotificationBadgeProps {
  count?: number;
  size?: number;
  color?: string;
}

const NotificationBadge = ({ 
  count = 0, 
  size = 24, 
  color = "#000" 
}: NotificationBadgeProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push("/(users)/notifications");
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {count > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {count > 99 ? "99+" : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default NotificationBadge;