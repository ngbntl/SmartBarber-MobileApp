import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import NotificationApi from "@/api/notifications";
import { NotificationApi as NotificationApiType } from "@/types/notificationApi";
import { formatDistance } from "date-fns";
import { Colors } from "@/constants/Colors";
import { classNames } from "@/utils/functions";
import { vi } from "date-fns/locale";

export default function StylistNotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationApiType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const notificationApiService = new NotificationApi();
      const response = await notificationApiService.getNotifications();
      console.log("Fetched notifications:", response);
      if (response && response.data) {
        setNotifications(response.data);
      } else if (Array.isArray(response)) {
        setNotifications(response);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.some((notification) => !notification.isRead)) {
      try {
        const notificationApiService = new NotificationApi();
        await notificationApiService.markAllAsRead();

        // Update local state to show all notifications as read
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
      }
    }
  };

  const handleNotificationPress = async (notification: NotificationApiType) => {
    // If notification is not read, mark it as read
    if (!notification.isRead) {
      try {
        const notificationApi = new NotificationApi();
        await notificationApi.markAsRead(notification.id);

        // Update local state to show notification as read
        setNotifications((prevNotifications) =>
          prevNotifications.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to notification detail screen
    router.push({
      pathname: "/(stylists)/notificationDetail",
      params: { id: notification.id },
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        );
      case "error":
        return <Ionicons name="alert-circle" size={24} color={Colors.error} />;
      case "warning":
        return <Ionicons name="warning" size={24} color={Colors.warning} />;
      case "promotion":
        return <Ionicons name="pricetag" size={24} color="#FF8F00" />;
      case "appointment":
        return <Ionicons name="calendar" size={24} color="#0288D1" />;
      case "system":
        return <Ionicons name="settings" size={24} color="#455A64" />;
      default:
        return (
          <Ionicons
            name="information-circle"
            size={24}
            color={Colors.primary}
          />
        );
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationApiType }) => {
    return (
      <TouchableOpacity
        className={classNames(
          "flex-row p-4 mb-3 rounded-lg items-center shadow",
          item.isRead ? "bg-gray-50" : "bg-white"
        )}
        onPress={() => handleNotificationPress(item)}
      >
        <View className="mr-4">{getNotificationIcon(item.type)}</View>
        <View className="flex-1">
          <Text className="text-base font-semibold mb-1">{item.title}</Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.content}
          </Text>
          <Text className="text-xs text-gray-400">
            {formatDistance(new Date(parseInt(item.createdAt)), new Date(), {
              addSuffix: true,
              locale: vi,
            })}
          </Text>
        </View>
        {!item.isRead && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </TouchableOpacity>
    );
  };

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.isRead
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Thông báo",
          headerShown: true,
          headerTitleStyle: { fontWeight: "bold" },
          headerBackTitle: "Quay lại",
          headerShadowVisible: false,
          headerRight: () =>
            hasUnreadNotifications ? (
              <TouchableOpacity className="px-2" onPress={handleMarkAllAsRead}>
                <Text className="text-primary text-sm font-medium">
                  Đánh dấu tất cả đã đọc
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      />
      <View className="flex-1 bg-gray-100">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons
              name="notifications-off-outline"
              size={60}
              color="#cccccc"
            />
            <Text className="text-base text-gray-500 mt-4 text-center">
              Bạn chưa có thông báo nào
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
              />
            }
          />
        )}
      </View>
    </>
  );
}
