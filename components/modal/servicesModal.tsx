import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import ServicesApi from "@/api/services";
import { formatPrice } from "@/utils/functions";
import PromotionsApi from "@/api/promotions";

interface ServicesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectServices: (services: any[], voucher?: any | null) => void;
  selectedServices: any[];
  selectedBranch: string | null;
}

const ServicesModal = ({
  visible,
  onClose,
  onSelectServices,
  selectedServices = [],
  selectedBranch,
}: ServicesModalProps) => {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedServices, setLocalSelectedServices] = useState<any[]>([]);
  const [showVoucherSection, setShowVoucherSection] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [vouchers, setVouchers] = useState<any>([]);
  const { width } = Dimensions.get("window");
  const cardWidth = (width - 48) / 2;

  const servicesApi = new ServicesApi();

  useEffect(() => {
    if (visible && selectedBranch) {
      fetchServices();
      fetchVouchers();
      setLocalSelectedServices([...selectedServices]);
    } else {
      setSearchQuery("");
    }
  }, [visible, selectedBranch]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const serviceData = await servicesApi.getServices();
      setServices(serviceData.items || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };
  const promotionsApi = new PromotionsApi();
  const fetchVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const voucherData = await promotionsApi.getPromotions();
      setVouchers(voucherData.items || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleServiceSelection = (service: any) => {
    const isSelected = isServiceSelected(service.id);

    if (isSelected) {
      const newSelection = localSelectedServices.filter(
        (selectedService) => selectedService.id !== service.id
      );
      setLocalSelectedServices(newSelection);
    } else {
      setLocalSelectedServices([...localSelectedServices, service]);
    }

    setSelectedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const isServiceSelected = (serviceId: string) => {
    return localSelectedServices.some((service) => service.id === serviceId);
  };

  const totalPrice = localSelectedServices.reduce(
    (sum, service) => sum + (service.price || 0),
    0
  );

  const totalDuration = localSelectedServices.reduce(
    (sum, service) => sum + (service.duration || 0),
    0
  );

  const applyVoucher = () => {
    setVoucherError("");
    if (!voucherCode.trim()) {
      setVoucherError(t("vouchers.enter_code"));
      return;
    }

    const voucher = vouchers.find(
      (v) => v.code.toLowerCase() === voucherCode.toLowerCase()
    );

    if (!voucher) {
      setVoucherError(t("vouchers.invalid_code"));
      return;
    }

    // Check if minimum amount is met
    if (totalPrice < voucher.minimumPurchaseAmount) {
      setVoucherError(
        t("vouchers.min_amount_required", {
          minAmount: formatPrice(voucher.minimumPurchaseAmount),
        })
      );
      return;
    }

    setSelectedVoucher(voucher);
  };

  const removeVoucher = () => {
    setSelectedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const calculateDiscountAmount = () => {
    if (!selectedVoucher) return 0;

    if (selectedVoucher.isPercentage === false) {
      return selectedVoucher.discountAmount;
    } else {
      // Percentage discount
      return Math.round(totalPrice * (selectedVoucher.discountPercent / 100));
    }
  };

  const finalPrice = totalPrice - calculateDiscountAmount();

  const handleConfirm = () => {
    onSelectServices(localSelectedServices, selectedVoucher);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-4 pt-3 pb-4 bg-white">
          <TouchableOpacity className="mr-4 p-1" onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold">
            {t("appointments.select_services")}
          </Text>
        </View>

        <View className="px-4 py-3">
          <View className="flex-row bg-white rounded-lg px-4 py-2.5 items-center border border-[#eee]">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder={t("appointments.search_services")}
              className="flex-1 ml-2 text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {localSelectedServices.length > 0 && (
          <View className="bg-white px-4 py-3 border-b border-[#eee]">
            <Text className="text-sm font-medium mb-2 text-[#666]">
              {t("appointments.selected_services")} (
              {localSelectedServices.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {localSelectedServices.map((service) => (
                <View
                  key={service.id}
                  className="flex-row items-center bg-primary rounded-2xl px-3 py-1.5 mr-2"
                >
                  <Text className="text-white text-xs mr-1">
                    {service.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleServiceSelection(service)}
                    className="ml-1"
                  >
                    <Ionicons name="close-circle" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            className="flex-1 justify-center items-center"
          />
        ) : (
          <>
            <FlatList
              data={filteredServices}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ width: cardWidth - 8 }}
                  className={`bg-white rounded-xl mb-4 shadow ${
                    isServiceSelected(item.id) ? "border-2 border-primary" : ""
                  }`}
                  onPress={() => toggleServiceSelection(item)}
                >
                  <View className="relative">
                    <Image
                      source={
                        item.image
                          ? { uri: item.image }
                          : require("@/assets/images/not-found.png")
                      }
                      className="w-full h-[120px] rounded-t-xl"
                      resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2">
                      <View
                        className={`w-6 h-6 rounded-full border items-center justify-center ${
                          isServiceSelected(item.id)
                            ? "bg-primary border-primary"
                            : "border-white bg-white/80"
                        }`}
                      >
                        {isServiceSelected(item.id) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </View>
                  </View>

                  <View className="p-3">
                    <Text className="text-base font-bold" numberOfLines={1}>
                      {item.name}
                    </Text>

                    <View className="flex-row justify-between mt-1 mb-2">
                      <Text className="text-base font-bold text-primary">
                        {formatPrice(item.price)}
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text className="text-xs text-[#666] ml-1">
                          {item.duration || 30} {t("appointments.minutes")}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-xs text-[#666]" numberOfLines={2}>
                      {item.description || "No description available"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{
                padding: 16,
                paddingTop: 8,
                paddingBottom: 180,
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="items-center justify-center p-10">
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text className="mt-3 text-base text-[#999]">
                    {t("appointments.no_results")}
                  </Text>
                </View>
              }
            />

            {localSelectedServices.length > 0 && (
              <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-[#eee] shadow-lg">
                <TouchableOpacity
                  className="flex-row items-center mb-3"
                  onPress={() => setShowVoucherSection(!showVoucherSection)}
                >
                  <Ionicons
                    name="ticket-outline"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text className="text-primary font-medium ml-2">
                    {selectedVoucher
                      ? t("vouchers.applied_voucher")
                      : t("vouchers.add_voucher")}
                  </Text>
                  <Ionicons
                    name={showVoucherSection ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.primary}
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                {showVoucherSection && (
                  <View className="mb-3 border border-[#eee] rounded-lg p-3">
                    {selectedVoucher ? (
                      <View>
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center">
                            <View className="bg-primary/10 px-3 py-1 rounded-md">
                              <Text className="text-primary font-bold">
                                {selectedVoucher.name}
                              </Text>
                            </View>
                            <Text className="text-green-600 ml-2">
                              {t("vouchers.applied")}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={removeVoucher}>
                            <Text className="text-red-500">
                              {t("vouchers.remove")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text className="text-sm text-gray-600">
                          {selectedVoucher.description}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <View className="flex-row mb-2">
                          <TextInput
                            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
                            placeholder={t("vouchers.enter_voucher_code")}
                            value={voucherCode}
                            onChangeText={setVoucherCode}
                            autoCapitalize="characters"
                          />
                          <TouchableOpacity
                            className="bg-primary px-4 py-2 rounded-r-lg items-center justify-center"
                            onPress={applyVoucher}
                          >
                            <Text className="text-white font-medium">
                              {t("vouchers.apply")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {voucherError ? (
                          <Text className="text-red-500 text-xs mb-2">
                            {voucherError}
                          </Text>
                        ) : null}

                        {/* Available vouchers section */}
                        <Text className="text-sm font-medium text-gray-600 mb-2">
                          {t("vouchers.available_vouchers")}
                        </Text>

                        {loadingVouchers ? (
                          <ActivityIndicator
                            size="small"
                            color={Colors.primary}
                          />
                        ) : vouchers.length > 0 ? (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            {vouchers.map((voucher) => (
                              <TouchableOpacity
                                key={voucher.id}
                                className="border border-gray-200 rounded-lg p-2 mr-3 min-w-[150px]"
                                onPress={() => {
                                  setVoucherCode(voucher.code);
                                  applyVoucher();
                                }}
                              >
                                <Text className="text-primary font-bold">
                                  {voucher.name}
                                </Text>
                                <Text className="text-xs text-gray-600 mt-1">
                                  {voucher.description}
                                </Text>
                                <Text className="text-xs text-green-600 mt-1">
                                  {voucher.isPercentage === false
                                    ? `${t("vouchers.discount")}: ${formatPrice(
                                        voucher.discountAmount
                                      )}`
                                    : `${t("vouchers.discount")}: ${
                                        voucher.discountPercent
                                      }%`}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        ) : (
                          <Text className="text-gray-500 text-sm">
                            {t("vouchers.no_vouchers")}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* Summary */}
                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base text-[#666]">
                      {t("appointments.total_duration")}:
                    </Text>
                    <Text className="text-base font-bold">
                      {totalDuration} {t("appointments.minutes")}
                    </Text>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base text-[#666]">
                      {t("appointments.total_price")}:
                    </Text>
                    <Text className="text-base font-bold">
                      {formatPrice(totalPrice)}
                    </Text>
                  </View>

                  {selectedVoucher && (
                    <View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-base text-[#666]">
                          {t("vouchers.discount")}:
                        </Text>
                        <Text className="text-base font-bold text-green-600">
                          -{formatPrice(calculateDiscountAmount())}
                        </Text>
                      </View>

                      <View className="flex-row justify-between mb-2 pt-2 border-t border-dashed border-[#eee]">
                        <Text className="text-base font-bold text-[#333]">
                          {t("vouchers.final_price")}:
                        </Text>
                        <Text className="text-lg font-bold text-primary">
                          {formatPrice(finalPrice)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  className="bg-primary py-3 rounded-3xl items-center"
                  onPress={handleConfirm}
                >
                  <Text className="text-white text-base font-bold">
                    {t("appointments.confirm")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default ServicesModal;
