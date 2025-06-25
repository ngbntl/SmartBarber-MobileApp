import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatDate } from "@/utils/functions";
import NotificationApi from "@/api/notifications";
import { NotificationApi as NotificationApiType } from "@/types/notificationApi";

export default function NotificationDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notification, setNotification] = useState<NotificationApiType | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotificationDetails();
  }, [id]);

  const fetchNotificationDetails = async () => {
    if (!id) {
      setError(t("errors.something_wrong"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const notificationApi = new NotificationApi();
      const response = await notificationApi.getDetails(id);

      if (response) {
        setNotification(response);

        // Mark as read if not already read
        if (!response.isRead) {
          await notificationApi.markAsRead(id);
        }
      } else {
        setError(t("errors.something_wrong"));
      }
    } catch (error) {
      console.error("Error fetching notification details:", error);
      setError(t("errors.network_error"));
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
        );
      case "error":
        return <Ionicons name="alert-circle" size={32} color={Colors.error} />;
      case "warning":
        return <Ionicons name="warning" size={32} color={Colors.warning} />;
      case "promotion":
        return <Ionicons name="pricetag" size={32} color="#FF8F00" />;
      case "appointment":
        return <Ionicons name="calendar" size={32} color="#0288D1" />;
      case "system":
        return <Ionicons name="settings" size={32} color="#455A64" />;
      default:
        return (
          <Ionicons
            name="information-circle"
            size={32}
            color={Colors.primary}
          />
        );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("notifications.notificationDetail"),
          headerShown: true,
          headerTitleStyle: { fontWeight: "bold" },
          headerBackTitle: t("common.back"),
          headerShadowVisible: false,
        }}
      />
      <View className="flex-1 bg-gray-100">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons
              name="alert-circle-outline"
              size={60}
              color={Colors.error}
            />
            <Text className="text-base text-gray-500 mt-4 text-center">
              {error}
            </Text>
            <TouchableOpacity
              className="mt-4 py-2 px-4 bg-primary rounded-lg"
              onPress={fetchNotificationDetails}
            >
              <Text className="text-white font-semibold">
                {t("common.retry")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : notification ? (
          <ScrollView className="flex-1 p-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-white justify-center items-center shadow">
                {getNotificationIcon(notification.type)}
              </View>
              <Text className="text-sm text-gray-500">
                {formatDate(parseInt(notification.createdAt))}
              </Text>
            </View>

            <Text className="text-2xl font-bold mb-4 text-gray-800">
              {notification.title}
            </Text>

            <View className="bg-white p-4 rounded-xl my-4 shadow-sm">
              <Text className="text-base leading-6 text-gray-700">
                {notification.content}
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons name="document-text-outline" size={60} color="#cccccc" />
            <Text className="text-base text-gray-500 mt-4 text-center">
              {t("notifications.notificationNotFound")}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
