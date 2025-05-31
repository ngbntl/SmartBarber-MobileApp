import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SetDayOffModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  date: Date;
  reason: string;
  onReasonChange: (text: string) => void;
}

const SetDayOffModal = ({
  visible,
  onClose,
  onConfirm,
  loading,
  date,
  reason,
  onReasonChange,
}: SetDayOffModalProps) => {
  const formattedDate = format(date, "EEEE, dd/MM/yyyy", { locale: vi });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl overflow-hidden">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
              <Text className="text-xl font-bold text-gray-800">
                Đặt ngày nghỉ
              </Text>
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Date Display */}
            <View className="px-5 py-3">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
                  <Ionicons name="calendar" size={20} color="#ef4444" />
                </View>
                <View className="ml-3">
                  <Text className="text-base font-bold text-gray-800 capitalize">
                    {formattedDate}
                  </Text>
                  <Text className="text-xs text-red-500">
                    Ngày nghỉ toàn bộ
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              className="max-h-[200px]"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {/* Reason Input */}
              <View className="mb-4 mt-2">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Lý do nghỉ
                </Text>
                <TextInput
                  className="bg-gray-50 rounded-xl py-2 px-3 border border-gray-200 text-gray-800"
                  placeholder="Nhập lý do nghỉ (không bắt buộc)"
                  value={reason}
                  onChangeText={onReasonChange}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{ minHeight: 80 }}
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="p-4 pt-2 border-t border-gray-100">
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl border border-gray-200 items-center justify-center"
                  onPress={onClose}
                >
                  <Text className="font-medium text-gray-700">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-primary items-center justify-center"
                  onPress={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
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
    </Modal>
  );
};

export default SetDayOffModal;
