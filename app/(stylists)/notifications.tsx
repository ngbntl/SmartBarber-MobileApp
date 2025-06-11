import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { format, formatDistanceToNow } from "date-fns";
import { vi, enUS, ja } from "date-fns/locale";

import { useTranslation } from "react-i18next";
import NotificationsApi from "@/api/notifications";
import { Notification } from "@/types/notification";
import { Colors } from "@/constants/Colors";
import { useNotification } from "@/hooks/useNotification";
import Toast from "@/components/ui/Toast";
import i18n from "@/lib/i18n";
import { useNotificationCount } from "@/hooks/useNotificationCount";

const getLocale = () => {
  const language = i18n.language;
  switch (language) {
    case "vi":
      return vi;
    case "ja":
      return ja;
    default:
      return enUS;
  }
};

const StylistNotificationsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast, setToast, appNotification } = useNotification();
  const { refreshCount } = useNotificationCount();

  const fetchNotifications = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        setLoading(true);
      }

      const notificationsApi = new NotificationsApi();
      const response = await notificationsApi.getUserNotifications({
        page: pageNum,
        limit: 10,
      });
      
      if (response.items) {
        if (refresh || pageNum === 1) {
          setNotifications(response.items);
        } else {
          setNotifications(prev => [...prev, ...response.items]);
        }
        setHasMore(response.items.length === 10);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setToast({
        message: t("notifications.fetch_error"),
        type: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, setToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(1, true);
    refreshCount(); // Update the unread count in the badge
  };

  const loadMoreNotifications = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const notificationsApi = new NotificationsApi();
      await notificationsApi.markAsRead(notificationId);
      
      // Update notifications list locally
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count in badge
      refreshCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;

    try {
      const notificationsApi = new NotificationsApi();
      const response = await notificationsApi.markAllAsRead();
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Update all notifications to read locally
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true
          }))
        );
        
        appNotification(response);
        refreshCount(); // Update unread count in badge
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read when pressed
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to specific screen if available in notification data
    if (notification.data?.routeName) {
      router.push({
        pathname: notification.data.routeName,
        params: notification.data.params || {}
      });
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: getLocale(),
      });
    }
    
    return format(date, "PPp", { locale: getLocale() });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`p-4 border-b border-gray-100 ${!item.isRead ? 'bg-blue-50' : 'bg-white'}`}
      >
        <View className="flex-row">
          <View className={`h-10 w-10 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: `${iconColor}20` }}>
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-gray-800">{item.title}</Text>
              <Text className="text-xs text-gray-500">{formatNotificationDate(item.createdAt)}</Text>
            </View>
            
            <Text className="text-gray-600 mt-1" numberOfLines={2}>
              {item.message}
            </Text>
            
            {!item.isRead && (
              <View className="h-2 w-2 rounded-full bg-blue-500 absolute top-1 right-1" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getNotificationIcon = (type: string): any => {
    switch (type) {
      case "success":
        return "checkmark-circle-outline";
      case "error":
        return "alert-circle-outline";
      case "warning":
        return "warning-outline";
      case "info":
      default:
        return "information-circle-outline";
    }
  };

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
      default:
        return "#3b82f6";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <SafeAreaView edges={["top"]} className="bg-white mt-14">
        <View className="flex-row items-center justify-between px-4 py-1.5 border-b border-[#f0f0f0]">
          <TouchableOpacity className="p-1.5" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text className="text-base font-bold">{t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <TouchableOpacity className="p-1.5" onPress={handleMarkAllAsRead}>
              <Text className="text-primary text-sm">{t('notifications.mark_all_read')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {loading && notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          onEndReached={loadMoreNotifications}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="notifications-outline" size={64} color="lightgray" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            {t('notifications.no_notifications')}
          </Text>
        </View>
      )}
    </View>
  );
};

export default StylistNotificationsScreen;