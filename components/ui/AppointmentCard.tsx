import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Appointment } from "../../types/appointments";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import useLanguage from "../../hooks/useLanguage";
import Icon from "@/assets/icons";
import { formatCountdown, formatPrice, formatTime } from "@/utils/functions";
import i18n from "@/lib/i18n";

// Helper function to get current locale
const getCurrentLocale = (): string => {
  const localeMap: Record<string, string> = {
    en: "en-US",
    vi: "vi-VN",
    ja: "ja-JP",
  };
  const language = i18n.language || "en";
  return localeMap[language] || "en-US";
};

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
  onCancel?: (appointmentId: string) => void;
  cancelingId?: string | null;
}

const AppointmentCard = ({
  appointment,
  compact = false,
  onCancel,
  cancelingId,
}: AppointmentCardProps) => {
  const { t } = useLanguage();
  const isPending = appointment.status?.toLowerCase() === "pending";

  const navigateToDetail = () => {
    router.push({
      pathname: "/(users)/appointments",
      params: { selected: appointment.id },
    });
  };

  return (
    <TouchableOpacity
      key={appointment.id}
      className="bg-white rounded-2xl p-4 mb-4"
      activeOpacity={0.7}
      onPress={navigateToDetail}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-primary/10 rounded-full justify-center items-center mr-3">
            <Icon name="calendar" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text className="font-bold text-base text-[#333]">
              {new Date(appointment.appointmentDate).toLocaleDateString(
                getCurrentLocale(),
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </Text>
            <Text className="text-gray-500 text-sm">
              {appointment.startTime?.substring(0, 5) ||
                formatTime(appointment.appointmentDate)}
            </Text>
          </View>
        </View>
        <View className="bg-primary/10 rounded-full px-3 py-1">
          <Text className="text-xs text-primary font-medium capitalize">
            {t(`appointment_status.${appointment.status.toLowerCase()}`)}
          </Text>
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <Ionicons name="location-outline" size={14} color={Colors.primary} />
          <Text className="text-gray-700 text-sm ml-1.5" numberOfLines={1}>
            {appointment.branchName || "Branch not specified"}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={14} color={Colors.primary} />
          <Text className="text-gray-700 text-sm ml-1.5">
            {appointment.stylistName || "Stylist not assigned"}
          </Text>
        </View>
      </View>

      {/* Services */}
      {appointment.services && appointment.services.length > 0 ? (
        <View className="mb-2">
          <Text className="text-xs text-gray-500 mb-1">
            {t("appointments.selected_services")}:
          </Text>
          {appointment.services.map((serviceItem, index) => (
            <View
              key={serviceItem.id}
              className="flex-row justify-between mb-1"
            >
              <Text
                className="text-sm text-gray-700"
                numberOfLines={1}
                style={{ width: "70%" }}
              >
                {serviceItem.service?.name || "Unknown service"}
              </Text>
              <Text className="text-sm text-gray-700 font-medium">
                {formatPrice(parseFloat(serviceItem.price || "0"))}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="mb-2">
          <Text className="text-sm text-gray-500">
            {t("appointments.no_services")}
          </Text>
        </View>
      )}

      <View className="h-[1px] bg-gray-200 my-2" />

      <View className="flex-row justify-between items-center mt-1">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#f97316" />
          <Text className="text-orange-500 font-medium ml-1 text-sm">
            {appointment.durationMinutes
              ? `${Math.floor(appointment.durationMinutes / 60)}h ${
                  appointment.durationMinutes % 60
                }m`
              : formatCountdown(appointment.appointmentDate)}
          </Text>
        </View>
        <Text className="font-bold text-primary">
          {formatPrice(parseFloat(appointment.finalAmount || "0"))}
        </Text>
      </View>

      {onCancel && isPending && (
        <TouchableOpacity
          className="mt-3 py-2 px-4 border border-red-500 rounded-lg self-end"
          onPress={() => onCancel(appointment.id)}
          disabled={cancelingId === appointment.id}
        >
          <Text className="text-red-500 font-medium text-sm">
            {cancelingId === appointment.id
              ? t("common.loading")
              : t("appointments.cancel_appointment")}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default AppointmentCard;
