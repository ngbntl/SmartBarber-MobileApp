import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import AppointmentsApi from "@/api/appointments";
import UserApi from "@/api/userApi";
import { formatTime, formatPrice, formatDate } from "@/utils/functions";
import { format } from "date-fns";

const ClientDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalSpent: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    firstVisit: null,
    lastVisit: null,
    favoriteService: { name: "", count: 0 },
  });

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const appointmentsApi = new AppointmentsApi();
      const userApi = new UserApi();

      // Fetch appointments and client info
      const appointmentsResponse = await appointmentsApi.getAppointments(
        id as string
      );
      const userResponse = await userApi.getUser(id as string);

      const clientAppointments = Array.isArray(appointmentsResponse)
        ? appointmentsResponse
        : appointmentsResponse?.items || [];

      if (clientAppointments.length === 0 && !userResponse) {
        setLoading(false);
        return;
      }

      // Sort appointments by date (newest first)
      clientAppointments.sort((a: any, b: any) => {
        return (
          new Date(b.appointmentDate).getTime() -
          new Date(a.appointmentDate).getTime()
        );
      });

      // Extract client information
      const clientInfo = userResponse
        ? {
            id: userResponse.id,
            name:
              userResponse.name ||
              `${userResponse.firstName} ${userResponse.lastName}`,
            avatar: userResponse.avatar || "",
            phoneNumber: userResponse.phoneNumber || "",
            email: userResponse.email || "",
          }
        : {
            id: clientAppointments[0].userId || id,
            name:
              clientAppointments[0].userName ||
              (clientAppointments[0].user
                ? `${clientAppointments[0].user.firstName} ${clientAppointments[0].user.lastName}`
                : "Khách hàng"),
            avatar: clientAppointments[0].user?.avatar || "",
            phoneNumber: clientAppointments[0].user?.phoneNumber || "",
            email: clientAppointments[0].user?.email || "",
          };

      // Calculate statistics
      const statsData = calculateStatistics(clientAppointments);

      setClient(clientInfo);
      setAppointments(clientAppointments);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching client details:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin khách hàng. Vui lòng thử lại sau.",
        [{ text: "Đóng" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (appointments: any[]) => {
    let totalSpent = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let firstVisit = new Date();
    let lastVisit = new Date(0);
    const serviceCount: Record<string, number> = {};

    appointments.forEach((appointment) => {
      // Calculate total spent
      const amount = parseFloat(
        appointment.finalAmount || appointment.totalAmount || 0
      );
      if (!isNaN(amount)) {
        totalSpent += amount;
      }

      // Count completed and cancelled appointments
      if (appointment.status?.toLowerCase() === "completed") {
        completedCount++;
      } else if (appointment.status?.toLowerCase() === "cancelled") {
        cancelledCount++;
      }

      // Track first and last visit dates
      const visitDate = appointment.createdAt
        ? new Date(appointment.createdAt)
        : new Date(appointment.appointmentDate);
      if (visitDate < firstVisit) {
        firstVisit = visitDate;
      }
      if (visitDate > lastVisit) {
        lastVisit = visitDate;
      }

      // Count services
      if (Array.isArray(appointment.services)) {
        appointment.services.forEach((service: any) => {
          const serviceName = service.service?.name || service.name;
          if (serviceName) {
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
          }
        });
      }
    });

    // Find favorite service
    let favoriteService = { name: "", count: 0 };
    Object.entries(serviceCount).forEach(([name, count]) => {
      if (count > favoriteService.count) {
        favoriteService = { name, count: count as number };
      }
    });

    return {
      totalAppointments: appointments.length,
      totalSpent,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,
      firstVisit: appointments.length > 0 ? firstVisit : null,
      lastVisit: appointments.length > 0 ? lastVisit : null,
      favoriteService: favoriteService.name
        ? favoriteService
        : { name: "Chưa có", count: 0 },
    };
  };

  const getAppointmentStatusColor = (status: string) => {
    if (!status) return "#94a3b8"; // gray default

    status = status.toLowerCase();
    if (status === "completed") return "#10b981"; // green
    if (status === "confirmed") return "#3b82f6"; // blue
    if (status === "pending") return "#f59e0b"; // amber
    if (status === "cancelled") return "#ef4444"; // red
    if (status === "no-show") return "#6b7280"; // gray

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

  const handlePhoneCall = () => {
    if (!client?.phoneNumber) {
      Alert.alert("Thông báo", "Không có số điện thoại để gọi.");
      return;
    }

    Linking.openURL(`tel:${client.phoneNumber}`);
  };

  const handleSendMessage = () => {
    if (!client?.phoneNumber) {
      Alert.alert("Thông báo", "Không có số điện thoại để gửi tin nhắn.");
      return;
    }

    Linking.openURL(`sms:${client.phoneNumber}`);
  };

  const handleSendEmail = () => {
    if (!client?.email) {
      Alert.alert("Thông báo", "Không có email để gửi tin nhắn.");
      return;
    }

    Linking.openURL(`mailto:${client.email}`);
  };

  const renderAppointmentItem = (appointment: any, index: number) => {
    const appointmentDate = new Date(appointment.appointmentDate);

    return (
      <TouchableOpacity
        key={appointment.id || index}
        className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2.5,
          elevation: 2,
        }}
        onPress={() => {
          router.push({
            pathname: "/(stylists)/appointment-details",
            params: { id: appointment.id },
          });
        }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-semibold text-gray-800">
            {format(appointmentDate, "EEEE, dd/MM/yyyy")}
          </Text>
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-1.5"
              style={{
                backgroundColor: getAppointmentStatusColor(appointment.status),
              }}
            />
            <Text className="text-xs text-gray-500">
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="time-outline" size={16} color="#94a3b8" />
          <Text className="ml-1 text-sm text-gray-700">
            {formatTime(appointmentDate)}
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Ionicons name="cut-outline" size={16} color="#94a3b8" />
          <Text className="ml-1 text-sm text-gray-700">
            {Array.isArray(appointment.services)
              ? appointment.services
                  .map((s: any) => s.service?.name || s.name)
                  .join(", ")
              : "Dịch vụ"}
          </Text>
        </View>

        <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
          <Text className="text-base font-bold text-primary">
            {formatPrice(
              appointment.finalAmount || appointment.totalAmount || 0
            )}
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className="mr-3"
              onPress={() => {
                // View appointment details
                router.push({
                  pathname: "/(stylists)/appointment-details",
                  params: { id: appointment.id },
                });
              }}
            >
              <Ionicons name="eye-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <StatusBar style="dark" />
        <View className="flex-1 bg-gray-50 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-gray-500 mt-4">
            Đang tải thông tin khách hàng...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!client) {
    return (
      <ScreenWrapper>
        <StatusBar style="dark" />
        <View className="flex-1 bg-gray-50 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={60} color="#94a3b8" />
          <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">
            Không tìm thấy thông tin
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6">
            Không thể tìm thấy thông tin của khách hàng này.
          </Text>
          <TouchableOpacity
            className="bg-primary py-3 px-6 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Chi tiết khách hàng",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: "#1f2937",
          },
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#1f2937",
          headerShadowVisible: false,
        }}
      />
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        {/* Client Profile Card */}
        <View className="bg-white p-5 border-b border-gray-200">
          <View className="flex-row items-center">
            <Image
              source={
                client.avatar
                  ? { uri: client.avatar }
                  : require("@/assets/images/default-avatar.png")
              }
              className="w-20 h-20 rounded-full"
            />

            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">
                {client.name}
              </Text>

              {client.phoneNumber ? (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="call-outline" size={14} color="#94a3b8" />
                  <Text className="ml-1 text-sm text-gray-500">
                    {client.phoneNumber}
                  </Text>
                </View>
              ) : null}

              {client.email ? (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="mail-outline" size={14} color="#94a3b8" />
                  <Text className="ml-1 text-sm text-gray-500">
                    {client.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              className="flex-1 items-center bg-primary/10 py-2 rounded-lg mr-2"
              onPress={handlePhoneCall}
            >
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text className="text-xs font-medium text-primary mt-1">Gọi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 items-center bg-primary/10 py-2 rounded-lg mx-2"
              onPress={handleSendMessage}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={Colors.primary}
              />
              <Text className="text-xs font-medium text-primary mt-1">
                Nhắn tin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 items-center bg-primary/10 py-2 rounded-lg ml-2"
              onPress={handleSendEmail}
            >
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <Text className="text-xs font-medium text-primary mt-1">
                Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View className="bg-white mt-3 p-5">
          <Text className="text-lg font-bold text-gray-800 mb-4">Thống kê</Text>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2 bg-gray-50 rounded-xl p-3 items-center">
              <Text className="text-gray-500 text-xs mb-1">Tổng chi tiêu</Text>
              <Text className="text-lg font-bold text-green-600">
                {formatPrice(stats.totalSpent)}
              </Text>
            </View>

            <View className="flex-1 ml-2 bg-gray-50 rounded-xl p-3 items-center">
              <Text className="text-gray-500 text-xs mb-1">
                Số lượt đặt lịch
              </Text>
              <Text className="text-lg font-bold text-primary">
                {stats.totalAppointments}
              </Text>
            </View>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2 bg-gray-50 rounded-xl p-3 items-center">
              <Text className="text-gray-500 text-xs mb-1">Hoàn thành</Text>
              <Text className="text-lg font-bold text-green-600">
                {stats.completedAppointments}
              </Text>
            </View>

            <View className="flex-1 ml-2 bg-gray-50 rounded-xl p-3 items-center">
              <Text className="text-gray-500 text-xs mb-1">Đã hủy</Text>
              <Text className="text-lg font-bold text-red-500">
                {stats.cancelledAppointments}
              </Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text className="ml-2 text-gray-700 font-medium">
                  Khách hàng từ
                </Text>
              </View>
              <Text className="text-gray-800 font-semibold">
                {stats.firstVisit
                  ? format(stats.firstVisit, "dd/MM/yyyy")
                  : "N/A"}
              </Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text className="ml-2 text-gray-700 font-medium">
                  Lần cuối sử dụng
                </Text>
              </View>
              <Text className="text-gray-800 font-semibold">
                {stats.lastVisit
                  ? format(stats.lastVisit, "dd/MM/yyyy")
                  : "N/A"}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="star-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text className="ml-2 text-gray-700 font-medium">
                  Dịch vụ ưa thích
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-800 font-semibold">
                  {stats.favoriteService.name}
                </Text>
                <View className="bg-primary/10 px-2 py-0.5 rounded-full ml-2">
                  <Text className="text-xs text-primary">
                    {stats.favoriteService.count}x
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Appointment History */}
        <View className="mt-3 p-5">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Lịch sử đặt lịch
          </Text>

          {appointments.length > 0 ? (
            <View>
              {appointments.map((appointment, index) =>
                renderAppointmentItem(appointment, index)
              )}
            </View>
          ) : (
            <View className="bg-white rounded-xl py-10 items-center justify-center border border-gray-100">
              <Ionicons name="calendar-outline" size={40} color="#94a3b8" />
              <Text className="text-base font-medium text-gray-700 mt-4">
                Chưa có lịch sử đặt lịch
              </Text>
              <Text className="text-sm text-gray-500 text-center px-6 mt-2">
                Khách hàng này chưa có lịch sử đặt lịch nào
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mt-3 p-5 mb-8">
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center mb-3"
            onPress={() => {
              // Navigate to create new appointment
              router.push("/(stylists)/create-appointment");
            }}
          >
            <Text className="text-white font-bold text-base">
              Tạo lịch hẹn mới
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-primary py-4 rounded-xl items-center"
            onPress={() => {
              // Navigate to edit client info
              router.push({
                pathname: "/(stylists)/edit-client",
                params: { id: client.id },
              });
            }}
          >
            <Text className="text-primary font-bold text-base">
              Chỉnh sửa thông tin
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ClientDetailScreen;
