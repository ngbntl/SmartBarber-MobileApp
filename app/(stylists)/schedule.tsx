import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useFocusEffect } from "expo-router";
import format from "date-fns/format";
import addDays from "date-fns/addDays";
import { vi } from "date-fns/locale";
import AppointmentsApi from "@/api/appointments";
import StylistApi from "@/api/stylist";
import {
  formatTime,
  formatPrice,
  isToday,
  formatDateWithWeekday,
} from "@/utils/functions";
import { Colors } from "@/constants/Colors";
import { RootState } from "@/store";
import Toast from "@/components/ui/Toast";
import { useNotification } from "@/hooks/useNotification";
import SetDayOffModal from "@/components/modal/setDayOffModal";

const appointmentsApi = new AppointmentsApi();
const stylistApi = new StylistApi();
const { width } = Dimensions.get("window");

const checkSameDay = (dateA: Date, dateB: Date): boolean => {
  return (
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
};

interface DayOff {
  id: string;
  date: string;
  reason?: string;
}

const Schedule = () => {
  const router = useRouter();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const { toast, setToast, appNotification } = useNotification();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days, setDays] = useState<Date[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthText, setMonthText] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [dayOffReason, setDayOffReason] = useState("");

  useEffect(() => {
    const daysArray = [];
    for (let i = -7; i <= 14; i++) {
      daysArray.push(addDays(new Date(), i));
    }
    setDays(daysArray);
    setMonthText(format(selectedDate, "MMMM yyyy", { locale: vi }));

    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 20) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    setTimeSlots(slots);
  }, []);

  useEffect(() => {
    setMonthText(format(selectedDate, "MMMM yyyy", { locale: vi }));
  }, [selectedDate]);

  const fetchDaysOff = useCallback(async () => {
    if (!userInfo?.id) return;

    try {
      const response = await stylistApi.getStylistDaysOff(userInfo.id);
      if (Array.isArray(response)) {
        setDaysOff(response);
      } else if (response && Array.isArray(response.items)) {
        setDaysOff(response.items);
      } else {
        setDaysOff([]);
      }
    } catch (error) {
      console.error("Error fetching stylist days off:", error);
      setDaysOff([]);
    } finally {
    }
  }, [userInfo?.id]);

  const fetchAppointments = useCallback(async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const response = await appointmentsApi.getStylistAppointments(
        userInfo.id
      );

      const allAppointments =
        response && response.items
          ? response.items
          : Array.isArray(response)
          ? response
          : [];

      const filteredAppointments = allAppointments.filter(
        (appointment: any) => {
          if (!appointment.appointmentDate) return false;
          const appointmentDate = new Date(appointment.appointmentDate);
          return checkSameDay(appointmentDate, selectedDate);
        }
      );

      filteredAppointments.sort((a: any, b: any) => {
        return (
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime()
        );
      });

      setAppointments(filteredAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate, userInfo?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      fetchDaysOff();
    }, [fetchAppointments, fetchDaysOff])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
    fetchDaysOff();
  };

  const isDayOff = useCallback(
    (date: Date) => {
      if (!daysOff || !daysOff.length) return false;

      return daysOff.some((dayOff) => {
        const dayOffDate = new Date(dayOff.date);
        return checkSameDay(dayOffDate, date);
      });
    },
    [daysOff]
  );

  const getDayOff = useCallback(
    (date: Date): DayOff | undefined => {
      if (!daysOff || !daysOff.length) return undefined;

      return daysOff.find((dayOff) => {
        const dayOffDate = new Date(dayOff.date);
        return checkSameDay(dayOffDate, date);
      });
    },
    [daysOff]
  );

  const addDayOff = async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const dateString = format(selectedDate, "yyyy-MM-dd");

      const dayOffData = {
        stylistId: userInfo.id,
        date: dateString,
        reason: dayOffReason || "",
      };

      const res = await stylistApi.addDayOff(dayOffData);

      appNotification(res);

      fetchDaysOff();
      setModalVisible(false);
      setDayOffReason("");
    } catch (error: any) {
      console.error("Error adding day off:", error);
      appNotification(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalError = (errorMessage: string) => {
    setToast({
      message: errorMessage,
      type: "error",
    });
  };

  const removeDayOff = async () => {
    if (!userInfo?.id) return;

    const dayOff = getDayOff(selectedDate);
    if (!dayOff) return;

    try {
      setLoading(true);
      const response = await stylistApi.removeDayOff(dayOff.id);
      appNotification(response);

      fetchDaysOff();
    } catch (error: any) {
      console.error("Error removing day off:", error);
      appNotification(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDayOff = () => {
    const isCurrentDateDayOff = isDayOff(selectedDate);

    if (isCurrentDateDayOff) {
      Alert.alert("Xóa ngày nghỉ", "Bạn có chắc chắn muốn xóa ngày nghỉ này?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: removeDayOff, style: "destructive" },
      ]);
    } else {
      if (appointments.length > 0) {
        Alert.alert(
          "Cảnh báo",
          `Bạn có ${appointments.length} cuộc hẹn vào ngày này. Bạn vẫn muốn đặt làm ngày nghỉ?`,
          [
            { text: "Hủy", style: "cancel" },
            { text: "Tiếp tục", onPress: () => setModalVisible(true) },
          ]
        );
      } else {
        setModalVisible(true);
      }
    }
  };

  const getAppointmentColor = (index: number) => {
    const colors = [
      { bg: "#e6f4f1", border: "#5ebeaf", textColor: "#0f766e" },
      { bg: "#fff0ee", border: "#ff6e61", textColor: "#dc2626" },
      { bg: "#f0e6ff", border: "#af8df5", textColor: "#7c3aed" },
      { bg: "#e6eeff", border: "#5e95ff", textColor: "#2563eb" },
      { bg: "#fff5e6", border: "#ffb84d", textColor: "#d97706" },
    ];
    return colors[index % colors.length];
  };

  const getStatusColor = (status: string) => {
    if (!status) return "#94a3b8";

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

    return status;
  };

  const renderDayItem = ({ item, index }: { item: Date; index: number }) => {
    const dayNumber = format(item, "d");
    const dayName = format(item, "EEE", { locale: vi });
    const isSelected = checkSameDay(item, selectedDate);
    const isCurrentDay = isToday(item);
    const isDayOffDate = isDayOff(item);

    return (
      <TouchableOpacity
        className={`w-16 h-20 justify-center items-center mr-2 rounded-3xl ${
          isSelected
            ? "bg-primary"
            : isCurrentDay
            ? "bg-white border border-primary"
            : isDayOffDate
            ? "bg-red-100 border border-red-300"
            : "bg-gray-100"
        }`}
        onPress={() => setSelectedDate(item)}
      >
        <Text
          className={`text-xs uppercase ${
            isSelected
              ? "text-white"
              : isCurrentDay
              ? "text-primary"
              : isDayOffDate
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {dayName}
        </Text>
        <Text
          className={`text-xl font-semibold ${
            isSelected
              ? "text-white"
              : isCurrentDay
              ? "text-primary"
              : isDayOffDate
              ? "text-red-500"
              : "text-gray-700"
          }`}
        >
          {dayNumber}
        </Text>
        {isSelected && (
          <View className="w-1.5 h-1.5 bg-white rounded-full mt-1" />
        )}
        {isDayOffDate && !isSelected && (
          <View className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1" />
        )}
      </TouchableOpacity>
    );
  };

  const renderAppointmentItem = (appointment: any, index: number) => {
    const color = getAppointmentColor(index);
    const appointmentTime = new Date(appointment.appointmentDate);
    const userAvatar = appointment.userAvatar || appointment.user?.avatar;
    const userName =
      appointment.userName || appointment.user?.firstName
        ? `${appointment.user?.firstName || ""} ${
            appointment.user?.lastName || ""
          }`.trim()
        : "Khách hàng";

    return (
      <TouchableOpacity
        key={appointment.id}
        className={`flex-row rounded-xl mb-4 border border-gray-100 overflow-hidden`}
        style={{
          borderLeftWidth: 4,
          borderLeftColor: color.border,
          backgroundColor: color.bg,
        }}
        onPress={() =>
          router.push({
            pathname: "/(stylists)/appointment-details",
            params: { id: appointment.id },
          })
        }
        activeOpacity={0.7}
      >
        <View className="w-20 items-center justify-center py-3 pl-2">
          <Text
            className="text-base font-semibold"
            style={{ color: color.textColor }}
          >
            {formatTime(appointmentTime)}
          </Text>
        </View>

        {/* Content column */}
        <View className="flex-1 py-3 pr-3">
          {/* Client info */}
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-white mr-2 overflow-hidden">
              <Image
                source={
                  userAvatar
                    ? { uri: userAvatar }
                    : require("@/assets/images/default-avatar.png")
                }
                className="w-full h-full"
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-semibold text-base"
                style={{ color: color.textColor }}
              >
                {userName}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <View
                  className="w-2 h-2 rounded-full mr-1"
                  style={{
                    backgroundColor: getStatusColor(appointment.status),
                  }}
                />
                <Text className="text-xs text-gray-600">
                  {getStatusText(appointment.status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Services */}
          <View className="flex-row items-center mb-1">
            <Ionicons name="cut-outline" size={14} color={color.textColor} />
            <Text className="ml-1 text-sm" style={{ color: color.textColor }}>
              {Array.isArray(appointment.services)
                ? appointment.services
                    .map((s: any) => s.service?.name || s.name)
                    .join(", ")
                : "Dịch vụ"}
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={14} color={color.textColor} />
            <Text
              className="ml-1 text-sm font-medium"
              style={{ color: color.textColor }}
            >
              {formatPrice(appointment.finalAmount || 0)}
            </Text>
          </View>

          {/* Notes if available */}
          {appointment.notes && (
            <View className="mt-2 pt-2 border-t border-gray-200">
              <Text className="text-xs text-gray-500 mb-1">Ghi chú:</Text>
              <Text className="text-sm text-gray-600">{appointment.notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayView = () => {
    if (loading && !refreshing) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    const isCurrentDateDayOff = isDayOff(selectedDate);
    const currentDayOff = getDayOff(selectedDate);

    return (
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isCurrentDateDayOff && (
          <View className="bg-red-100 border border-red-300 rounded-xl p-4 my-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#ef4444" />
                <Text className="ml-2 font-bold text-red-600">Ngày nghỉ</Text>
              </View>
              <TouchableOpacity
                className="bg-red-50 rounded-full p-2"
                onPress={toggleDayOff}
              >
                <Ionicons name="close-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
            {currentDayOff?.reason && (
              <Text className="text-red-600 mt-2">{currentDayOff.reason}</Text>
            )}
          </View>
        )}

        {appointments.length > 0 ? (
          <>
            <View className="flex-row justify-between items-center my-3">
              <Text className="text-gray-500 text-sm">
                {appointments.length} cuộc hẹn vào{" "}
                {format(selectedDate, "dd/MM/yyyy")}
              </Text>

              {!isCurrentDateDayOff && (
                <TouchableOpacity
                  className="flex-row items-center bg-gray-100 rounded-full px-3 py-1"
                  onPress={toggleDayOff}
                >
                  <Ionicons name="calendar-outline" size={16} color="#64748b" />
                  <Text className="ml-1 text-sm text-gray-600">
                    Đặt ngày nghỉ
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {appointments.map((appointment, index) =>
              renderAppointmentItem(appointment, index)
            )}
          </>
        ) : (
          <View className="flex-1 justify-center items-center py-16">
            <Ionicons
              name={isCurrentDateDayOff ? "bed-outline" : "calendar-outline"}
              size={80}
              color={isCurrentDateDayOff ? "#ef4444" : "#d1d5db"}
            />
            <Text className="text-gray-400 text-base mt-4 text-center px-8">
              {isCurrentDateDayOff
                ? "Đây là ngày nghỉ của bạn"
                : `Không có cuộc hẹn nào vào ${format(
                    selectedDate,
                    "dd/MM/yyyy"
                  )}`}
            </Text>

            {!isCurrentDateDayOff && (
              <TouchableOpacity
                className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4"
                onPress={toggleDayOff}
              >
                <Ionicons name="calendar-outline" size={18} color="#64748b" />
                <Text className="ml-1 text-gray-600">Đặt ngày nghỉ</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    );
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["bottom", "left", "right"]}
      >
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Lịch làm việc",
            headerTitleStyle: { fontSize: 18, fontWeight: "600" },
            headerShadowVisible: false,
          }}
        />

        {/* Header with date info */}
        <View className="flex-row justify-between items-center px-4 py-2">
          <View>
            <Text className="text-lg font-semibold text-gray-800 capitalize">
              {formatSelectedDate(selectedDate)}
            </Text>
            <Text className="text-sm text-gray-500 capitalize">
              {monthText}
            </Text>
          </View>
        </View>

        {/* Calendar days */}
        <View className="border-b border-gray-100 py-2">
          <FlatList
            data={days}
            renderItem={renderDayItem}
            keyExtractor={(item) => item.toISOString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            initialScrollOffset={width / 2}
          />
        </View>

        {/* Main content - appointments */}
        {renderDayView()}

        {/* Modal for adding day off */}
        <SetDayOffModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={addDayOff}
          loading={loading}
          date={selectedDate}
          reason={dayOffReason}
          onReasonChange={setDayOffReason}
        />
      </SafeAreaView>
    </>
  );
};

const formatSelectedDate = (date: Date) => {
  if (isToday(date)) {
    return "Hôm nay";
  }
  return formatDateWithWeekday(date);
};

export default Schedule;
