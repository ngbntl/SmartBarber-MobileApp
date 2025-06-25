import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { Colors } from "@/constants/Colors";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import AppointmentsApi from "@/api/appointments";
import ReviewApi from "@/api/reviews";
import NotificationApi from "@/api/notifications";
import { formatTime, formatPrice } from "@/utils/functions";
import { format } from "date-fns";
import Toast from "@/components/ui/Toast";
import { useNotification } from "@/hooks/useNotification";
import { RootState } from "@/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const StylistHomeScreen = () => {
  const router = useRouter();
  const { toast, setToast } = useNotification();
  const fadeAnim = useState(new Animated.Value(0))[0];

  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalClients: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    fetchUnreadNotificationCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotificationCount();
    }, [])
  );

  const fetchUnreadNotificationCount = async () => {
    try {
      const notificationApi = new NotificationApi();
      const response = await notificationApi.getUnreadCount();

      if (response && typeof response.count === "number") {
        setUnreadCount(response.count);
        setHasNewNotifications(response.count > 0);
      } else if (typeof response === "number") {
        setUnreadCount(response);
        setHasNewNotifications(response > 0);
      } else {
        setUnreadCount(0);
        setHasNewNotifications(false);
      }
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      setUnreadCount(0);
      setHasNewNotifications(false);
    }
  };

  const fetchAppointments = async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const appointmentsApi = new AppointmentsApi();
      const response = await appointmentsApi.getStylistAppointments(
        userInfo.id
      );

      const appointments =
        response && response.items
          ? response.items
          : Array.isArray(response)
          ? response
          : [];

      const today = new Date();

      const todayAppts = appointments.filter((appt: any) => {
        if (!appt.appointmentDate) return false;
        const apptDate = new Date(appt.appointmentDate);
        return (
          apptDate.getDate() === today.getDate() &&
          apptDate.getMonth() === today.getMonth() &&
          apptDate.getFullYear() === today.getFullYear()
        );
      });

      todayAppts.sort((a: any, b: any) => {
        return (
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime()
        );
      });

      setTodayAppointments(todayAppts);

      setStats({
        totalAppointments: appointments.length,
        totalClients: new Set(
          appointments.map((a: any) => a.userId || a.user?.id || "")
        ).size,
        totalRevenue: appointments.reduce((sum: number, appt: any) => {
          const amount = parseFloat(appt.finalAmount || appt.totalAmount || 0);
          return isNaN(amount) ? sum : sum + amount;
        }, 0),
      });
    } catch (error) {
      console.error("Error fetching stylist appointments:", error);
      setTodayAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchReviews = async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const reviewApi = new ReviewApi();
      const response = await reviewApi.getReviews(userInfo.id);

      const reviews =
        response && response.items
          ? response.items
          : Array.isArray(response)
          ? response
          : [];

      setReviews(reviews);
    } catch (error) {
      console.error("Error fetching stylist reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
    fetchReviews();
  }, [userInfo?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      fetchReviews();
    }, [userInfo?.id])
  );

  const getAppointmentColor = (index: number) => {
    const colors = [
      { bg: "#e6f4f1", border: "#5ebeaf", icon: "#5ebeaf" }, // xanh lá
      { bg: "#fff0ee", border: "#ff6e61", icon: "#ff6e61" }, // đỏ nhạt
      { bg: "#f0e6ff", border: "#af8df5", icon: "#af8df5" }, // tím
      { bg: "#e6eeff", border: "#5e95ff", icon: "#5e95ff" }, // xanh dương
      { bg: "#fff5e6", border: "#ffb84d", icon: "#ffb84d" }, // cam
    ];
    return colors[index % colors.length];
  };

  const renderAppointmentItem = (appointment: any, index: number) => {
    const color = getAppointmentColor(index);
    const appointmentTime = new Date(appointment.appointmentDate);

    return (
      <Animated.View
        key={appointment.id}
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          className={`flex-row bg-white rounded-xl mb-3 border border-gray-100 p-3 overflow-hidden`}
          style={{ borderLeftWidth: 4, borderLeftColor: color.border }}
          onPress={() =>
            router.push({
              pathname: "/(stylists)/appointment-details",
              params: { id: appointment.id },
            })
          }
          activeOpacity={0.7}
        >
          <View className="items-center w-[60px]">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mb-1`}
              style={{ backgroundColor: color.bg }}
            >
              <Ionicons name="time-outline" size={16} color={color.icon} />
            </View>
            <Text className="text-sm font-semibold text-gray-600">
              {formatTime(appointmentTime)}
            </Text>
          </View>

          <View className="flex-1 px-3">
            <Text
              className="text-base font-semibold text-gray-800"
              numberOfLines={1}
            >
              {appointment.userName || appointment.name || "Khách hàng"}
            </Text>
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              {Array.isArray(appointment.services)
                ? appointment.services
                    .map((s: any) => s.service?.name || s.name)
                    .join(", ")
                : "Dịch vụ"}
            </Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="font-bold text-primary">
                {formatPrice(appointment.finalAmount || 0)}
              </Text>
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{
                    backgroundColor: getStatusColor(appointment.status),
                  }}
                />
                <Text className="text-xs text-gray-500">
                  {getStatusText(appointment.status)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="py-1 px-1 justify-center">
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getStatusColor = (status: string) => {
    if (!status) return "#94a3b8"; // gray default

    status = status.toLowerCase();
    if (status === "completed") return "#10b981"; // green
    if (status === "confirmed") return "#3b82f6"; // blue
    if (status === "pending") return "#f59e0b"; // amber
    if (status === "cancelled") return "#ef4444"; // red

    return "#94a3b8"; // gray default
  };

  const getStatusText = (status: string) => {
    if (!status) return "Chờ xác nhận";

    status = status.toLowerCase();
    if (status === "completed") return "Hoàn thành";
    if (status === "confirmed") return "Đã xác nhận";
    if (status === "pending") return "Chờ xác nhận";
    if (status === "cancelled") return "Đã hủy";
    if (status === "no-show") return "Không đến";

    return status;
  };

  const renderReviewItem = (review: any) => {
    return (
      <Animated.View
        key={review.id}
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Image
                source={
                  review.avatar
                    ? { uri: review.avatar }
                    : require("@/assets/images/default-avatar.png")
                }
                className="w-10 h-10 rounded-full mr-3"
              />
              <View>
                <Text className="text-base font-semibold text-gray-800">
                  {review.userName}
                </Text>
                <Text className="text-xs text-gray-500">{review.date}</Text>
              </View>
            </View>
            <View className="flex-row">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? "star" : "star-outline"}
                    size={14}
                    color={i < review.rating ? "#FFD700" : "#cbd5e1"}
                    className="ml-0.5"
                  />
                ))}
            </View>
          </View>
          <Text className="text-sm text-gray-700 leading-5">
            {review.comment}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Stack.Screen
        options={{
          title: "Trang chủ",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: "#ffffff",
          },
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: "#fff",
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero section with gradient background */}
        <View
          className="pt-10 pb-10 rounded-b-[30px]"
          style={{
            backgroundColor: Colors.primary,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
          }}
        >
          <View className="px-5 mt-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-white/80">Xin chào,</Text>
                <Text className="text-2xl font-bold text-white">
                  {userInfo?.firstName} {userInfo?.lastName}
                </Text>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity
                  className="relative mr-4"
                  onPress={() => router.push("/(stylists)/notifications")}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color="#ffffff"
                  />
                  {hasNewNotifications && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                      <Text className="text-[10px] font-bold text-white">
                        {/* Placeholder for notification count */}
                        {unreadCount > 99 ? "99+" : unreadCount || ""}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View className="relative">
                  <Image
                    source={
                      userInfo?.avatar
                        ? { uri: userInfo.avatar }
                        : require("@/assets/images/default-avatar.png")
                    }
                    className="w-14 h-14 rounded-full border-2 border-white/50"
                  />
                  <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                </View>
              </View>
            </View>

            <View className="flex-row items-center mt-5">
              <Ionicons name="calendar-outline" size={18} color="#ffffff" />
              <Text className="text-white ml-2 font-medium text-sm">
                {format(new Date(), "EEEE, dd MMMM yyyy")}
              </Text>
            </View>
          </View>
        </View>

        {/* Dashboard content */}
        <View className="mt-[-20px] px-4 bg-gray-50 rounded-t-[30px] pt-6 pb-8 shadow-lg">
          {/* Stats cards */}
          <View className="flex-row justify-between mb-5">
            {/* Total Appointments */}
            <View className="bg-white rounded-2xl p-4 items-center w-[31%] shadow-sm">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2 bg-[#3b82f6]"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={24}
                  color="#ffffff"
                />
              </View>
              <Text className="text-base font-bold text-gray-900">
                {stats.totalAppointments}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Cuộc hẹn</Text>
            </View>

            {/* Total Clients */}
            <View className="bg-white rounded-2xl p-4 items-center w-[31%] shadow-sm">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2 bg-[#8b5cf6]"
                style={{
                  shadowColor: "#8b5cf6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color="#ffffff"
                />
              </View>
              <Text className="text-base font-bold text-gray-900">
                {stats.totalClients}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Khách hàng</Text>
            </View>

            {/* Total Revenue */}
            <View className="bg-white rounded-2xl p-4 items-center w-[31%] shadow-sm">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2 bg-[#10b981]"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <MaterialCommunityIcons
                  name="chart-areaspline"
                  size={24}
                  color="#ffffff"
                />
              </View>
              <Text className="text-base font-bold text-gray-900">
                {stats.totalRevenue >= 1000000
                  ? `${(stats.totalRevenue / 1000000).toFixed(1)}tr`
                  : formatPrice(stats.totalRevenue).replace("₫", "")}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Doanh thu</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-900">
              Truy cập nhanh
            </Text>

            <View className="mt-4">
              <TouchableOpacity
                className="flex-row items-center bg-white rounded-2xl p-3 mb-3 border border-gray-100"
                onPress={() => router.push("/(stylists)/schedule")}
                activeOpacity={0.7}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-[#3B82F6]"
                  style={{
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={22}
                    color="#ffffff"
                  />
                </View>
                <Text className="text-base font-medium text-gray-800">
                  Lịch làm việc
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-white rounded-2xl p-3 mb-3 border border-gray-100"
                onPress={() => router.push("/(stylists)/clients")}
                activeOpacity={0.7}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-[#8B5CF6]"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={22}
                    color="#ffffff"
                  />
                </View>
                <Text className="text-base font-medium text-gray-800">
                  Khách hàng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-white rounded-2xl p-3 border border-gray-100"
                onPress={() => router.push("/(stylists)/profile")}
                activeOpacity={0.7}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-[#EF4444]"
                  style={{
                    shadowColor: "#EF4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={22}
                    color="#ffffff"
                  />
                </View>
                <Text className="text-base font-medium text-gray-800">
                  Hồ sơ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's appointments */}
          <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="today-outline"
                  size={22}
                  color={Colors.primary}
                  className="mr-2"
                />
                <Text className="text-lg font-bold text-gray-900">
                  Lịch hẹn hôm nay
                </Text>
              </View>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push("/(stylists)/schedule")}
              >
                <Text className="text-sm font-medium text-primary mr-1">
                  Xem tất cả
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text className="text-sm text-gray-500 mt-2">Đang tải...</Text>
              </View>
            ) : todayAppointments.length > 0 ? (
              <View>
                {todayAppointments.map((appointment, index) =>
                  renderAppointmentItem(appointment, index)
                )}
              </View>
            ) : (
              <View className="bg-gray-50 rounded-xl py-6 items-center border border-gray-100">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                  <Ionicons name="calendar-outline" size={34} color="#94a3b8" />
                </View>
                <Text className="text-base font-medium text-gray-700 mb-1">
                  Ngày trống
                </Text>
                <Text className="text-sm text-gray-500 text-center px-6 mb-3">
                  Bạn không có lịch hẹn nào trong hôm nay
                </Text>
                <TouchableOpacity
                  className="flex-row items-center bg-primary/10 rounded-full px-4 py-2"
                  activeOpacity={0.7}
                  onPress={() => router.push("/(stylists)/schedule")}
                >
                  <MaterialCommunityIcons
                    name="calendar-plus"
                    size={16}
                    color={Colors.primary}
                  />
                  <Text className="ml-1 text-sm font-medium text-primary">
                    Xem lịch làm việc
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Customer reviews */}
          <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="star-outline"
                  size={22}
                  color={Colors.primary}
                  className="mr-2"
                />
                <Text className="text-lg font-bold text-gray-900">
                  Đánh giá của khách hàng
                </Text>
              </View>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-sm font-medium text-primary mr-1">
                  Xem tất cả
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text className="text-sm text-gray-500 mt-2">Đang tải...</Text>
              </View>
            ) : reviews.length > 0 ? (
              <View>{reviews.map((review) => renderReviewItem(review))}</View>
            ) : (
              <View className="bg-gray-50 rounded-xl py-8 items-center border border-gray-100">
                <Ionicons name="star-outline" size={40} color="#cbd5e1" />
                <Text className="text-sm text-gray-500 mt-2">
                  Chưa có đánh giá nào
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </View>
  );
};

export default StylistHomeScreen;
