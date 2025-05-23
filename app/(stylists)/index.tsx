import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import StylistApi from "../../api/stylist";
import AppointmentsApi from "../../api/appointments";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Loading from "../../components/ui/Loading";
import {
  formatDate,
  formatTime,
  isToday,
  formatPrice,
} from "@/utils/functions";
import { Colors } from "@/constants/Colors";
import Icon from "@/assets/icons";

// Khởi tạo các API
const stylistApi = new StylistApi();
const appointmentsApi = new AppointmentsApi();

const StylistHome = () => {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [stats, setStats] = useState({
    bookings: 98,
    listings: 15,
    reviews: 30,
    earnings: 45.3,
  });

  // Lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);

      // Trong thực tế, bạn sẽ lấy dữ liệu thống kê từ API
      // Ví dụ:
      // const statsData = await stylistApi.getStats(user.id);
      // setStats(statsData);

      // Lấy lịch làm việc và cuộc hẹn của stylist
      if (user && user.id) {
        // Lấy các cuộc hẹn của stylist
        const appointmentsData = await appointmentsApi.getAppointments(user.id);

        // Phân loại các cuộc hẹn
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAppts = appointmentsData.filter((appointment: any) => {
          const appointmentDate = new Date(appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === today.getTime();
        });

        const upcomingAppts = appointmentsData
          .filter((appointment: any) => {
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate.getTime() > today.getTime();
          })
          .slice(0, 5); // Chỉ lấy 5 cuộc hẹn sắp tới

        setTodayAppointments(todayAppts);
        setUpcomingAppointments(upcomingAppts);
      }
    } catch (error) {
      console.error("Error fetching stylist data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Xử lý refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right"]}
    >
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Phần header mới - giống với header của user */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2 mb-5">
          <View>
            <Text className="text-base text-gray-500 font-medium">
              Xin chào,
            </Text>
            <Text className="text-2xl font-bold text-[#333]">
              {user?.firstName || user?.fullName || "Stylist"}
            </Text>
          </View>
          <TouchableOpacity
            className="w-11 h-11 bg-white rounded-full shadow-md justify-center items-center"
            activeOpacity={0.7}
            onPress={() => router.push("/(stylists)/profile")}
          >
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : require("../../assets/images/default-avatar.png")
              }
              className="w-9 h-9 rounded-full"
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          className="flex-row items-center bg-white rounded-2xl px-5 py-4 mx-6 mb-7 shadow-md"
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={22} color="#A0A0A0" />
          <Text className="ml-3 text-[#A0A0A0] text-base font-medium">
            Tìm kiếm lịch hẹn...
          </Text>
        </TouchableOpacity>
        
        {/* Phần thống kê nhanh - UI mới */}
        <View className="mx-6 mb-6">
          <View className="bg-white rounded-2xl shadow-md p-4">
            <Text className="text-lg font-bold mb-3 ml-2">Thống kê hôm nay</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-1">
                  <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
                </View>
                <Text className="text-2xl font-bold">{todayAppointments.length}</Text>
                <Text className="text-gray-500 text-xs">Hôm nay</Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-1">
                  <Ionicons name="time-outline" size={22} color="#10b981" />
                </View>
                <Text className="text-2xl font-bold">{upcomingAppointments.length}</Text>
                <Text className="text-gray-500 text-xs">Sắp tới</Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-1">
                  <Ionicons name="checkmark-done-outline" size={22} color="#f97316" />
                </View>
                <Text className="text-2xl font-bold">
                  {todayAppointments.filter((apt: any) => apt.status === "completed").length}
                </Text>
                <Text className="text-gray-500 text-xs">Hoàn thành</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dashboard Cards - Giống hình ảnh mẫu */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Text style={styles.statsNumber}>{stats.bookings}</Text>
              <Text style={styles.statsLabel}>Bookings</Text>
            </View>
            <View style={styles.statsIconContainer}>
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Text style={styles.statsNumber}>{stats.listings}</Text>
              <Text style={styles.statsLabel}>Listings</Text>
            </View>
            <View style={styles.statsIconContainer}>
              <Ionicons name="list-outline" size={20} color="#6366f1" />
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Text style={styles.statsNumber}>{stats.reviews}</Text>
              <Text style={styles.statsLabel}>Reviews</Text>
            </View>
            <View style={styles.statsIconContainer}>
              <Ionicons name="star-outline" size={20} color="#6366f1" />
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Text style={styles.statsNumber}>${stats.earnings}k</Text>
              <Text style={styles.statsLabel}>Earnings</Text>
            </View>
            <View style={styles.statsIconContainer}>
              <Ionicons name="cash-outline" size={20} color="#6366f1" />
            </View>
          </View>
        </View>

        {/* Phần thống kê nhanh */}
        <View className="flex-row justify-between bg-gray-50 rounded-xl p-4 mb-6">
          <View className="items-center">
            <Text className="text-gray-500">Hôm nay</Text>
            <Text className="text-2xl font-bold">
              {todayAppointments.length}
            </Text>
            <Text className="text-gray-500">Cuộc hẹn</Text>
          </View>
          <View style={styles.divider} />
          <View className="items-center">
            <Text className="text-gray-500">Sắp tới</Text>
            <Text className="text-2xl font-bold">
              {upcomingAppointments.length}
            </Text>
            <Text className="text-gray-500">Cuộc hẹn</Text>
          </View>
          <View style={styles.divider} />
          <View className="items-center">
            <Text className="text-gray-500">Hoàn thành</Text>
            <Text className="text-2xl font-bold">
              {
                todayAppointments.filter(
                  (apt: any) => apt.status === "completed"
                ).length
              }
            </Text>
            <Text className="text-gray-500">Hôm nay</Text>
          </View>
        </View>

        {/* Các chức năng nhanh */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className="bg-blue-500 rounded-xl p-4 items-center flex-1 mr-2"
            onPress={() => router.push("/(stylists)/appointments")}
          >
            <Ionicons name="calendar-outline" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Lịch hẹn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-500 rounded-xl p-4 items-center flex-1 mx-2"
            onPress={() => router.push("/(stylists)/clients")}
          >
            <Ionicons name="people-outline" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Khách hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-purple-500 rounded-xl p-4 items-center flex-1 ml-2"
            onPress={() => router.push("/(stylists)/profile")}
          >
            <Ionicons name="person-outline" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Cuộc hẹn hôm nay */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold">Cuộc hẹn hôm nay</Text>
            <TouchableOpacity
              onPress={() => router.push("/(stylists)/appointments")}
            >
              <Text className="text-blue-500">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-6 items-center justify-center">
              <Text className="text-gray-400">
                Không có cuộc hẹn nào hôm nay
              </Text>
            </View>
          ) : (
            todayAppointments.map((appointment: any, index: number) => (
              <TouchableOpacity
                key={appointment.id || index}
                className="bg-gray-50 rounded-xl p-4 mb-2"
                onPress={() =>
                  router.push({
                    pathname: "/(stylists)/appointment-details",
                    params: { id: appointment.id },
                  })
                }
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#3b82f6"
                      />
                    </View>
                    <View>
                      <Text className="font-semibold">
                        {appointment.clientName || "Khách hàng"}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {appointment.serviceName || "Dịch vụ"}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text className="font-medium text-right">
                      {formatTime(new Date(appointment.date))}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full mt-1 ${
                        appointment.status === "completed"
                          ? "bg-green-100"
                          : appointment.status === "canceled"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <Text
                        className={`text-xs text-center ${
                          appointment.status === "completed"
                            ? "text-green-600"
                            : appointment.status === "canceled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {appointment.status === "completed"
                          ? "Hoàn thành"
                          : appointment.status === "canceled"
                          ? "Đã hủy"
                          : "Chờ xử lý"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Cuộc hẹn sắp tới */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold">Cuộc hẹn sắp tới</Text>
            <TouchableOpacity
              onPress={() => router.push("/(stylists)/appointments")}
            >
              <Text className="text-blue-500">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-6 items-center justify-center">
              <Text className="text-gray-400">Không có cuộc hẹn sắp tới</Text>
            </View>
          ) : (
            upcomingAppointments.map((appointment: any, index: number) => (
              <TouchableOpacity
                key={appointment.id || index}
                className="bg-gray-50 rounded-xl p-4 mb-2"
                onPress={() =>
                  router.push({
                    pathname: "/(stylists)/appointment-details",
                    params: { id: appointment.id },
                  })
                }
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#3b82f6"
                      />
                    </View>
                    <View>
                      <Text className="font-semibold">
                        {appointment.clientName || "Khách hàng"}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {appointment.serviceName || "Dịch vụ"}
                      </Text>
                      <Text className="text-blue-500 text-sm">
                        {formatDate(new Date(appointment.date))}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text className="font-medium text-right">
                      {formatTime(new Date(appointment.date))}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full mt-1 ${
                        appointment.status === "completed"
                          ? "bg-green-100"
                          : appointment.status === "canceled"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <Text
                        className={`text-xs text-center ${
                          appointment.status === "completed"
                            ? "text-green-600"
                            : appointment.status === "canceled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {appointment.status === "completed"
                          ? "Hoàn thành"
                          : appointment.status === "canceled"
                          ? "Đã hủy"
                          : "Chờ xử lý"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: "#e5e7eb",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  statsCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsContent: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  statsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StylistHome;
