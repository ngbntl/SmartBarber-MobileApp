import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Platform,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import AppointmentsApi from "@/api/appointments";
import { RootState } from "@/store";
import {
  formatTime,
  formatPrice,
  formatDateWithWeekday,
} from "@/utils/functions";
import { Colors } from "@/constants/Colors";
import Toast from "@/components/ui/Toast";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "react-i18next";
import Button from "@/components/button/Button";

const appointmentsApi = new AppointmentsApi();

const AppointmentDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { toast, setToast, appNotification } = useNotification();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [noShowLoading, setNoShowLoading] = useState(false);
  const [inProgressLoading, setInProgressLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Add state for modal visibility and reason text
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await appointmentsApi.getStylistAppointments(
        userInfo?.id
      );

      const foundAppointment =
        response?.items?.find((item: any) => item.id === id) || null;

      if (foundAppointment) {
        setAppointment(foundAppointment);
      } else {
        setToast({
          message: "Không tìm thấy thông tin cuộc hẹn",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: "Đã xảy ra lỗi khi tải thông tin cuộc hẹn",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmAppointment = async () => {
    if (!appointment?.id) return;

    Alert.alert(
      "Xác nhận cuộc hẹn",
      "Bạn có chắc chắn muốn xác nhận cuộc hẹn này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              setConfirmLoading(true);
              const response = await appointmentsApi.stylistConfirmAppointment(
                appointment.id
              );
              console.log(response);
              appNotification(response);

              setAppointment({
                ...appointment,
                status: "confirmed",
              });

              await fetchAppointmentDetails();
            } catch (error) {
              appNotification(error);
            } finally {
              setConfirmLoading(false);
            }
          },
        },
      ]
    );
  };

  const completeAppointment = async () => {
    if (!appointment?.id) return;

    Alert.alert(
      "Hoàn thành cuộc hẹn",
      "Bạn có chắc chắn muốn đánh dấu cuộc hẹn này đã hoàn thành?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Hoàn thành",
          onPress: async () => {
            try {
              setCompleteLoading(true);
              const response = await appointmentsApi.updateAppointmentStatus(
                appointment.id,
                "completed"
              );
              appNotification(response);

              setAppointment({
                ...appointment,
                status: "completed",
              });

              await fetchAppointmentDetails();
            } catch (error) {
              appNotification(error);
            } finally {
              setCompleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const markAsNoShow = async () => {
    if (!appointment?.id) return;

    Alert.alert(
      "Khách không đến",
      "Bạn có chắc chắn muốn đánh dấu khách không đến cuộc hẹn này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              setNoShowLoading(true);
              const response = await appointmentsApi.updateAppointmentStatus(
                appointment.id,
                "no-show"
              );
              appNotification(response);

              setAppointment({
                ...appointment,
                status: "no-show",
              });

              await fetchAppointmentDetails();
            } catch (error) {
              console.error("Error marking appointment as no-show:", error);
              appNotification(error);
            } finally {
              setNoShowLoading(false);
            }
          },
        },
      ]
    );
  };

  const startAppointment = async () => {
    if (!appointment?.id) return;

    Alert.alert(
      "Bắt đầu cuộc hẹn",
      "Bạn có chắc chắn muốn bắt đầu cuộc hẹn này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Bắt đầu",
          onPress: async () => {
            try {
              setInProgressLoading(true);
              const response = await appointmentsApi.updateAppointmentStatus(
                appointment.id,
                "in-progress"
              );
              appNotification(response);

              setAppointment({
                ...appointment,
                status: "in-progress",
              });

              await fetchAppointmentDetails();
            } catch (error) {
              appNotification(error);
            } finally {
              setInProgressLoading(false);
            }
          },
        },
      ]
    );
  };

  const cancelAppointment = async () => {
    if (!appointment?.id) return;

    // Show modal to enter reason instead of alert
    setCancelModalVisible(true);
  };

  const handleCancelAppointment = async () => {
    if (!appointment?.id || !cancelReason.trim()) {
      setToast({
        message: "Vui lòng nhập lý do hủy cuộc hẹn",
        type: "error",
      });
      return;
    }

    try {
      setCancelLoading(true);
      const response = await appointmentsApi.stylistCancelAppointment(
        appointment.id,
        cancelReason
      );
      appNotification(response);

      setAppointment({
        ...appointment,
        status: "cancelled",
      });

      await fetchAppointmentDetails();

      // Reset and close modal
      setCancelReason("");
      setCancelModalVisible(false);
    } catch (error) {
      appNotification(error);
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "#94a3b8";

    status = status.toLowerCase();
    if (status === "completed") return "#10b981"; // green
    if (status === "confirmed") return "#3b82f6"; // blue
    if (status === "pending") return "#f59e0b"; // amber
    if (status === "cancelled") return "#ef4444"; // red
    if (status === "in-progress") return "#8b5cf6"; // purple

    return "#94a3b8";
  };

  const getStatusText = (status: string) => {
    if (!status) return t("appointment_status.pending");

    status = status.toLowerCase();
    return t(`appointment_status.${status}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Chi tiết cuộc hẹn",
            headerTitleStyle: { fontSize: 18, fontWeight: "600" },
          }}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Chi tiết cuộc hẹn",
            headerTitleStyle: { fontSize: 18, fontWeight: "600" },
          }}
        />
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={60} color="#94a3b8" />
          <Text className="text-gray-500 text-center mt-4">
            Không tìm thấy thông tin cuộc hẹn
          </Text>
          <TouchableOpacity
            className="mt-4 bg-gray-100 px-4 py-2 rounded-full"
            onPress={() => router.replace("/(stylists)/schedule")}
          >
            <Text className="text-gray-700">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const appointmentTime = new Date(appointment.appointmentDate);
  const userAvatar = appointment.userAvatar || appointment.user?.avatar;
  const userName =
    appointment.userName || appointment.user?.firstName
      ? `${appointment.user?.firstName || ""} ${
          appointment.user?.lastName || ""
        }`.trim()
      : "Khách hàng";
  const isPending = appointment.status?.toLowerCase() === "pending";
  const isConfirmed = appointment.status?.toLowerCase() === "confirmed";
  const isInProgress = appointment.status?.toLowerCase() === "in-progress";
  const appointmentPassed = new Date() > appointmentTime;

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["bottom", "left", "right"]}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Stack.Screen
        options={{
          headerShown: true,
          title: "Chi tiết cuộc hẹn",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.replace("/(stylists)/schedule")}
              style={{ padding: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View
          className="rounded-xl p-4 mx-4 mt-3 mb-4"
          style={{ backgroundColor: `${getStatusColor(appointment.status)}20` }}
        >
          <View className="flex-row items-center">
            <View
              className="h-3 w-3 rounded-full mr-2"
              style={{ backgroundColor: getStatusColor(appointment.status) }}
            />
            <Text
              className="text-base font-medium"
              style={{ color: getStatusColor(appointment.status) }}
            >
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        {/* Appointment details */}
        <View className="bg-gray-50 rounded-xl p-4 mx-4 mb-4">
          <Text className="text-sm text-gray-500 mb-3">Chi tiết cuộc hẹn</Text>

          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text className="ml-3 text-base">
              {formatDateWithWeekday(appointmentTime)}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text className="ml-3 text-base">
              {formatTime(appointmentTime)}
            </Text>
          </View>

          <View className="flex-row items-start mb-3">
            <Ionicons
              name="cut-outline"
              size={20}
              color="#64748b"
              style={{ marginTop: 2 }}
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium">Dịch vụ</Text>
              {Array.isArray(appointment.services) ? (
                appointment.services.map((service: any, index: number) => (
                  <View
                    key={index}
                    className="mt-2 pb-2 border-b border-gray-200 last:border-0"
                  >
                    <Text className="font-medium">
                      {service.service?.name || service.name}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {formatPrice(
                        service.price || service.service?.price || 0
                      )}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="mt-1 text-gray-500">
                  Không có thông tin dịch vụ
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={20} color="#64748b" />
            <Text className="ml-3 text-base font-semibold">
              Tổng: {formatPrice(appointment.finalAmount || 0)}
            </Text>
          </View>
        </View>

        {/* Notes if available */}
        {appointment.notes && (
          <View className="bg-gray-50 rounded-xl p-4 mx-4 mb-4">
            <Text className="text-sm text-gray-500 mb-2">Ghi chú</Text>
            <Text className="text-gray-700">{appointment.notes}</Text>
          </View>
        )}

        {/* Actions */}
        {isPending && (
          <View className="mx-4 mt-4 mb-4">
            <Button
              title="Xác nhận cuộc hẹn"
              onPress={confirmAppointment}
              loading={confirmLoading}
              disabled={confirmLoading}
              className="rounded-lg"
            />

            {/* Cancel button for Pending status */}
            <View className="mt-3">
              <TouchableOpacity
                onPress={cancelAppointment}
                disabled={cancelLoading}
                className={`flex-row items-center p-4 rounded-xl ${
                  cancelLoading ? "bg-red-100" : "bg-red-500"
                } shadow-sm`}
                activeOpacity={0.8}
              >
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="#ef4444"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">
                    {cancelLoading ? "Đang xử lý..." : "Hủy cuộc hẹn"}
                  </Text>
                  <Text className="text-white text-xs opacity-90 mt-1">
                    Hủy cuộc hẹn với khách hàng
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isConfirmed && (
          <View className="px-4 mt-4 mb-8">
            <Text className="font-semibold text-gray-700 mb-3">
              Cập nhật trạng thái:
            </Text>

            <TouchableOpacity
              onPress={startAppointment}
              disabled={inProgressLoading}
              className={`flex-row items-center p-4 mb-3 rounded-xl ${
                inProgressLoading ? "bg-purple-100" : "bg-purple-600"
              } shadow-sm`}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Ionicons name="play" size={22} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {inProgressLoading ? "Đang xử lý..." : "Bắt đầu cuộc hẹn"}
                </Text>
                <Text className="text-white text-xs opacity-90 mt-1">
                  Đánh dấu cuộc hẹn là đang diễn ra
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={markAsNoShow}
              disabled={noShowLoading || completeLoading}
              className={`flex-row items-center p-4 rounded-xl ${
                noShowLoading ? "bg-red-100" : "bg-red-500"
              } shadow-sm`}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Ionicons name="close" size={22} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {noShowLoading ? "Đang xử lý..." : "Khách không đến"}
                </Text>
                <Text className="text-white text-xs opacity-90 mt-1">
                  Đánh dấu khách hàng đã không đến cuộc hẹn
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="white" />
            </TouchableOpacity>

            {/* Cancel button for Confirmed status */}
            <TouchableOpacity
              onPress={cancelAppointment}
              disabled={cancelLoading}
              className={`flex-row items-center p-4 mt-3 rounded-xl ${
                cancelLoading ? "bg-red-100" : "bg-red-500"
              } shadow-sm`}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="close-circle-outline"
                  size={22}
                  color="#ef4444"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {cancelLoading ? "Đang xử lý..." : "Hủy cuộc hẹn"}
                </Text>
                <Text className="text-white text-xs opacity-90 mt-1">
                  Hủy cuộc hẹn với khách hàng
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {isInProgress && (
          <View className="px-4 mt-4 mb-8">
            <Text className="font-semibold text-gray-700 mb-3">
              Cập nhật trạng thái:
            </Text>

            <TouchableOpacity
              onPress={completeAppointment}
              disabled={completeLoading}
              className={`flex-row items-center p-4 mb-3 rounded-xl ${
                completeLoading ? "bg-green-100" : "bg-green-600"
              } shadow-sm`}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Ionicons name="checkmark" size={22} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {completeLoading ? "Đang xử lý..." : "Đánh dấu hoàn thành"}
                </Text>
                <Text className="text-white text-xs opacity-90 mt-1">
                  Xác nhận dịch vụ đã được thực hiện
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Cancel appointment reason modal */}
      <Modal
        visible={cancelModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View className="flex-1 justify-end bg-black/50">
              <View
                className="bg-white rounded-t-3xl overflow-hidden"
                style={{
                  paddingBottom: Platform.OS === "android" ? 0 : insets.bottom,
                  maxHeight: Dimensions.get("window").height * 0.7,
                }}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
                  <Text className="text-xl font-bold text-gray-800">
                    Hủy cuộc hẹn
                  </Text>
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                    onPress={() => setCancelModalVisible(false)}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Appointment Info */}
                <View className="px-5 py-3">
                  <View className="flex-row items-center">
                    <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
                      <Ionicons name="calendar" size={20} color="#ef4444" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-base font-bold text-gray-800">
                        {formatDateWithWeekday(appointmentTime)}
                      </Text>
                      <Text className="text-xs text-red-500">
                        Hủy cuộc hẹn với khách hàng
                      </Text>
                    </View>
                  </View>
                </View>

                <ScrollView
                  className="max-h-[200px]"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Reason Input */}
                  <View className="mb-4 mt-2">
                    <Text className="text-gray-700 text-sm font-medium mb-2">
                      Lý do hủy
                    </Text>
                    <TextInput
                      className="bg-gray-50 rounded-xl py-2 px-3 border border-gray-200 text-gray-800"
                      placeholder="Nhập lý do hủy cuộc hẹn (bắt buộc)"
                      value={cancelReason}
                      onChangeText={setCancelReason}
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={{ minHeight: 80 }}
                    />
                  </View>
                </ScrollView>

                {/* Action Buttons */}
                <View className="p-4 pt-2 border-t border-gray-100">
                  <View className="flex-row space-x-3 pb-4">
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl border border-gray-200 items-center justify-center"
                      onPress={() => setCancelModalVisible(false)}
                    >
                      <Text className="font-medium text-gray-700">Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl items-center justify-center bg-red-500"
                      onPress={handleCancelAppointment}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text className="font-medium text-white">Xác nhận</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default AppointmentDetails;
