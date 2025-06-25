import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import {
  formatPrice,
  formatAppointmentDate,
  formatTimeSlot,
} from "@/utils/functions";

interface BookingConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointmentData: {
    branch: any;
    services: any[];
    stylist: any;
    dateTime: Date | null;
    timeSlot?: string;
    totalPrice?: number;
    discountAmount?: number;
    discountPercentage: number;
    voucher: any | null;
  };
  isLoading?: boolean;
}

const BookingConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  appointmentData,
  isLoading = false,
}: BookingConfirmationModalProps) => {
  const { t } = useTranslation();

  if (
    !appointmentData ||
    !appointmentData.branch ||
    !appointmentData.stylist ||
    !appointmentData.services ||
    !appointmentData.dateTime
  ) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black/50">
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-center">
                {t("appointments.booking_confirmation")}
              </Text>
              <View className="w-8" />
            </View>

            {/* Content */}
            <ScrollView className="px-4 pt-2 pb-6">
              <View className="bg-primary/10 rounded-xl p-4 mb-4">
                <Text className="text-lg font-bold text-primary mb-2">
                  {t("appointments.appointment_details")}
                </Text>

                {/* Branch */}
                <View className="flex-row mb-4">
                  <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-sm">
                      {t("appointments.branch")}
                    </Text>
                    <Text className="text-gray-800 font-medium">
                      {appointmentData.branch.name}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {appointmentData.branch.address}
                    </Text>
                  </View>
                </View>

                {/* Stylist */}
                <View className="flex-row mb-4">
                  <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-sm">
                      {t("appointments.stylist")}
                    </Text>
                    <Text className="text-gray-800 font-medium">
                      {appointmentData.stylist.firstName}{" "}
                      {appointmentData.stylist.lastName}
                    </Text>
                  </View>
                </View>

                {/* Date & Time */}
                <View className="flex-row mb-4">
                  <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-sm">
                      {t("appointments.date_time")}
                    </Text>
                    <Text className="text-gray-800 font-medium">
                      {formatAppointmentDate(appointmentData.dateTime)}
                    </Text>
                    <Text className="text-gray-600">
                      {appointmentData.timeSlot || ""}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Services */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  {t("appointments.selected_services")}
                </Text>

                {appointmentData.services.map((service, index) => (
                  <View
                    key={service.id}
                    className="flex-row justify-between py-2 items-center border-b border-gray-200 last:border-b-0"
                    style={
                      index === appointmentData.services.length - 1
                        ? { borderBottomWidth: 0 }
                        : {}
                    }
                  >
                    <View className="flex-1">
                      <Text className="text-gray-800 font-medium">
                        {service.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text className="text-xs text-[#666] ml-1">
                          {service.duration || 30} {t("appointments.minutes")}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-700 font-medium">
                      {formatPrice(service.price)}
                    </Text>
                  </View>
                ))}

                {/* Pricing Summary */}
                <View className="mt-4 pt-3 border-t border-gray-300">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">
                      {t("appointments.subtotal")}
                    </Text>
                    <Text className="text-gray-700 font-medium">
                      {formatPrice(appointmentData.totalPrice || 0)}
                    </Text>
                  </View>

                  {appointmentData.voucher && (
                    <View className="flex-row justify-between mb-1">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="ticket-outline"
                          size={14}
                          color="green"
                        />
                        <Text className="text-green-600 ml-1">
                          {appointmentData.voucher.name}
                        </Text>
                      </View>
                      <Text className="text-green-600 font-medium">
                        -{formatPrice(appointmentData.discountAmount || 0)}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row justify-between mt-2 pt-2 border-t border-dashed border-gray-300">
                    <Text className="text-gray-800 font-bold">
                      {t("appointments.total")}
                    </Text>
                    <Text className="text-primary font-bold text-lg">
                      {formatPrice(appointmentData.totalPrice || 0)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Payment Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  {t("appointments.payment_info")}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="cash-outline" size={20} color="#666" />
                  <Text className="ml-2 text-gray-700">
                    {t("appointments.pay_at_salon")}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500">
                  {t("appointments.payment_note")}
                </Text>
              </View>

              {/* Cancellation Policy */}
              <View className="mb-4">
                <Text className="text-xs text-gray-500 leading-4">
                  {t("appointments.cancellation_note")}
                </Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="p-4 border-t border-gray-200 shadow-lg">
              <TouchableOpacity
                className="bg-primary py-4 rounded-xl items-center"
                onPress={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-base ml-2">
                      {t("common.processing")}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base">
                    {t("appointments.confirm_and_book")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default BookingConfirmationModal;
