import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";

const NotificationsScreen = () => {
  // Sample notifications data
  const notifications = [
    {
      id: "1",
      title: "Appointment Confirmed",
      message:
        "Your appointment with Alana Barber has been confirmed for tomorrow at 2:00 PM.",
      time: "10 min ago",
      read: false,
    },
    {
      id: "2",
      title: "New Promotion",
      message: "Get 20% off on your next haircut service!",
      time: "2 hours ago",
      read: true,
    },
    {
      id: "3",
      title: "Appointment Reminder",
      message: "Don't forget your appointment tomorrow at 2:00 PM.",
      time: "5 hours ago",
      read: true,
    },
  ];

  const renderNotificationItem = ({ item }) => (
    <View style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      {!item.read && <View style={styles.unreadDot} />}
      <View style={styles.notificationIcon}>
        <Ionicons name="notifications" size={24} color="#555" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    position: "relative",
  },
  unreadItem: {
    backgroundColor: "#f0f8ff",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007bff",
    position: "absolute",
    top: 16,
    right: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
  },
});
