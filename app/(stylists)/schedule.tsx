import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
// Fix date-fns imports to use compatible format
import format from "date-fns/format";
import addDays from "date-fns/addDays";
import isSameDay from "date-fns/isSameDay"; // Added missing isSameDay import
import { vi } from "date-fns/locale";
import AppointmentsApi from "@/api/appointments";
import StylistApi from "@/api/stylist";
import {
  formatTime,
  formatDate,
  formatPrice,
  isToday,
  formatDateWithWeekday,
} from "@/utils/functions";
import { Colors } from "@/constants/Colors";

const appointmentsApi = new AppointmentsApi();
const stylistApi = new StylistApi();

// Hàm isSameDay tự định nghĩa để tránh xung đột với date-fns
const checkSameDay = (dateA: Date, dateB: Date): boolean => {
  return (
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
};

const Schedule = () => {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days, setDays] = useState<Date[]>([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState("day"); // 'day' or 'week'

  // Khởi tạo 7 ngày từ hôm nay
  useEffect(() => {
    const daysArray = [];
    for (let i = -3; i <= 3; i++) {
      daysArray.push(addDays(new Date(), i));
    }
    setDays(daysArray);
  }, []);

  // Tải các cuộc hẹn
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        // Trong thực tế, bạn sẽ gọi API với tham số date
        const response = await appointmentsApi.getAppointments(user.id);

        // Lọc các cuộc hẹn theo ngày đã chọn
        const filteredAppointments = response.filter((appointment: any) => {
          const appointmentDate = new Date(appointment.date);
          return checkSameDay(appointmentDate, selectedDate);
        });

        // Sắp xếp theo thời gian
        filteredAppointments.sort((a: any, b: any) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setAppointments(filteredAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tải lại dữ liệu khi thay đổi ngày hoặc refresh
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // Lấy màu sắc cho từng cuộc hẹn (để tạo sự đa dạng)
  const getAppointmentColor = (index: number) => {
    const colors = [
      { bg: "#e6f4f1", border: "#5ebeaf" }, // xanh lá
      { bg: "#fff0ee", border: "#ff6e61" }, // đỏ nhạt
      { bg: "#f0e6ff", border: "#af8df5" }, // tím
      { bg: "#e6eeff", border: "#5e95ff" }, // xanh dương
      { bg: "#fff5e6", border: "#ffb84d" }, // cam
    ];
    return colors[index % colors.length];
  };

  const renderDayItem = ({ item, index }: { item: Date; index: number }) => {
    const dayNumber = format(item, "d");
    const dayName = format(item, "EEE", { locale: vi });
    const isSelected = checkSameDay(item, selectedDate);
    const isCurrentDay = isToday(item);

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.selectedDayItem,
          isCurrentDay && !isSelected && styles.todayItem,
        ]}
        onPress={() => setSelectedDate(item)}
      >
        <Text
          style={[
            styles.dayName,
            isSelected && styles.selectedDayText,
            isCurrentDay && !isSelected && styles.todayText,
          ]}
        >
          {dayName}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.selectedDayText,
            isCurrentDay && !isSelected && styles.todayText,
          ]}
        >
          {dayNumber}
        </Text>
        {isSelected && <View style={styles.selectedIndicator} />}
      </TouchableOpacity>
    );
  };

  // ... remaining code stays the same

  const formatSelectedDate = () => {
    if (isToday(selectedDate)) {
      return "Hôm nay";
    }

    // Use our utility function instead of direct date-fns format
    return formatDateWithWeekday(selectedDate);
  };

  // ... rest of the component remains unchanged

  const renderAppointmentItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const color = getAppointmentColor(index);
    const appointmentTime = new Date(item.date);

    return (
      <TouchableOpacity
        style={[
          styles.appointmentItem,
          { borderLeftColor: color.border, backgroundColor: color.bg },
        ]}
        onPress={() =>
          router.push({
            pathname: "/(stylists)/appointment-details",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.appointmentTime}>
          <Text style={styles.timeText}>{formatTime(appointmentTime)}</Text>
        </View>

        <View style={styles.appointmentContent}>
          <Text style={styles.clientName}>
            {item.clientName || "Khách hàng"}
          </Text>
          <Text style={styles.serviceName}>
            {item.serviceName || "Dịch vụ"}
          </Text>
          <Text style={styles.price}>{formatPrice(item.totalAmount || 0)}</Text>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Ghi chú:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Lịch làm việc",
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.dateTitle}>{formatSelectedDate()}</Text>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === "day" && styles.activeViewToggle,
            ]}
            onPress={() => setViewType("day")}
          >
            <Text
              style={[
                styles.viewToggleText,
                viewType === "day" && styles.activeViewToggleText,
              ]}
            >
              Ngày
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === "week" && styles.activeViewToggle,
            ]}
            onPress={() => setViewType("week")}
          >
            <Text
              style={[
                styles.viewToggleText,
                viewType === "week" && styles.activeViewToggleText,
              ]}
            >
              Tuần
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <FlatList
          data={days}
          renderItem={renderDayItem}
          keyExtractor={(item) => item.toISOString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.appointmentsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <View key={appointment.id || index}>
                {renderAppointmentItem({ item: appointment, index })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={50} color="#d1d5db" />
              <Text style={styles.emptyText}>
                Không có cuộc hẹn nào vào ngày này
              </Text>
            </View>
          )}

          {/* Khoảng cách dưới cùng */}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... styles remain unchanged
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    textTransform: "capitalize",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeViewToggle: {
    backgroundColor: Colors.primary,
  },
  viewToggleText: {
    color: "#64748b",
    fontWeight: "500",
  },
  activeViewToggleText: {
    color: "white",
  },
  calendarContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  daysContainer: {
    paddingHorizontal: 16,
  },
  dayItem: {
    width: 60,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
  },
  selectedDayItem: {
    backgroundColor: Colors.primary,
  },
  todayItem: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "white",
  },
  dayName: {
    fontSize: 14,
    color: "#64748b",
    textTransform: "uppercase",
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#334155",
  },
  selectedDayText: {
    color: "white",
  },
  todayText: {
    color: Colors.primary,
  },
  selectedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
    marginTop: 4,
  },
  appointmentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  appointmentItem: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#5ebeaf",
    overflow: "hidden",
  },
  appointmentTime: {
    width: 70,
    paddingLeft: 12,
    paddingTop: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  appointmentContent: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  serviceName: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginTop: 2,
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  notesText: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  moreButton: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Schedule;
