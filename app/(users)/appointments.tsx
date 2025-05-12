import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Components
import BranchesModal from "../../components/modal/branchesModal";
import ServicesModal from "../../components/modal/servicesModal";
import Button from "../../components/button/Button";

import { Service } from "../../types/services";
import { Branch } from "@/types/branch";
import { formatPrice } from "@/utils/functions";
import StylistApi from "@/api/stylist";
import Loading from "@/components/ui/Loading";
import { Colors } from "@/constants/Colors";
import TimeSlotsApi from "@/api/time-slots";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Voucher {
  id: string;
  code: string;
  description: string;
  discountAmount: number;
  discountType: "fixed" | "percentage";
  minOrderAmount: number;
  expiryDate: string;
}

interface AppointmentState {
  currentStep: number;
  selectedBranch: Branch | null;
  selectedServices: Service[];
  selectedDateTime: Date | null;
  selectedStylist: any | null;
  selectedTimeSlot: string | null;
  selectedDate: Date;
  selectedVoucher: Voucher | null;
}

const AppointmentsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [bookingState, setBookingState] = useState<AppointmentState>({
    currentStep: 0,
    selectedBranch: null,
    selectedServices: [],
    selectedDateTime: null,
    selectedStylist: null,
    selectedTimeSlot: null,
    selectedDate: new Date(),
    selectedVoucher: null,
  });
  const {
    currentStep,
    selectedBranch,
    selectedServices,
    selectedDateTime,
    selectedStylist,
    selectedTimeSlot,
    selectedDate,
    selectedVoucher,
  } = bookingState;

  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [modalState, setModalState] = useState({
    branchModalVisible: false,
    serviceModalVisible: false,
    datetimeModalVisible: false,
  });
  const { branchModalVisible, serviceModalVisible, datetimeModalVisible } =
    modalState;
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const stylistApi = new StylistApi();
  const timeSlotsApi = new TimeSlotsApi();
  const [stylists, setStylists] = useState<any[]>([]);
  const [stylistSchedule, setStylistSchedule] = useState<any>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any>([]);

  const [loadingState, setLoadingState] = useState({
    loadingStylists: false,
    loadingSchedule: false,
    loadingTimeSlots: false,
  });
  const { loadingStylists, loadingSchedule, loadingTimeSlots } = loadingState;

  useEffect(() => {
    const fetchStylists = async () => {
      if (selectedBranch?.id) {
        setLoadingState((prevState) => ({
          ...prevState,
          loadingStylists: true,
        }));
        try {
          const response = await stylistApi.getStylistByBranchId(
            selectedBranch.id
          );
          setStylists(response.items || []);
        } catch (error) {
          console.error("Error fetching stylists:", error);
          setStylists([]);
        } finally {
          setLoadingState((prevState) => ({
            ...prevState,
            loadingStylists: false,
          }));
        }
      } else {
        setStylists([]);
      }
    };

    fetchStylists();
  }, [selectedBranch]);

  useEffect(() => {
    const fetchStylistSchedules = async () => {
      if (selectedStylist?.id) {
        setLoadingState((prevState) => ({
          ...prevState,
          loadingSchedule: true,
        }));
        try {
          const response = await stylistApi.getStylistSchedule(
            selectedStylist.id
          );
          setStylistSchedule(response.days || []);

          updateAvailableDates(response.days || []);

          fetchAvailableTimeSlots(selectedStylist.id, selectedDate);
        } catch (error) {
          console.error("Error fetching stylist schedule:", error);
          setStylistSchedule([]);
        } finally {
          setLoadingState((prevState) => ({
            ...prevState,
            loadingSchedule: false,
          }));
        }
      } else {
        setStylistSchedule([]);
      }
    };

    fetchStylistSchedules();
  }, [selectedStylist]);

  const updateAvailableDates = (workingDays: any) => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    setAvailableDates(dates);

    const formattedSelectedDate = formatDateString(selectedDate);
    const isSelectedDateWorking = workingDays.find(
      (day: any) => day.date === formattedSelectedDate
    )?.isWorking;

    if (!isSelectedDateWorking) {
      const firstWorkingDay = workingDays.find((day: any) => day.isWorking);
      if (firstWorkingDay) {
        const [year, month, day] = firstWorkingDay.date.split("-");
        const newDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        setBookingState((prevState) => ({
          ...prevState,
          selectedDate: newDate,
        }));
      }
    }
  };

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleBranchSelect = (branch: Branch) => {
    setBookingState((prevState) => ({
      ...prevState,
      selectedBranch: branch,
      currentStep: 1,
    }));
    setModalState((prevState) => ({ ...prevState, branchModalVisible: false }));
  };

  const handleServiceSelect = (
    services: Service[],
    voucher: Voucher | null = null
  ) => {
    setBookingState((prevState) => ({
      ...prevState,
      selectedServices: services,
      selectedVoucher: voucher,
      currentStep: 2,
    }));
    setModalState((prevState) => ({
      ...prevState,
      serviceModalVisible: false,
    }));
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    const dateTime = new Date(selectedDate);
    const [hours, minutes] = timeSlot.split("h").map((num) => parseInt(num));
    dateTime.setHours(hours, minutes || 0, 0);

    setBookingState((prevState) => ({
      ...prevState,
      selectedTimeSlot: timeSlot,
      selectedDateTime: dateTime,
      currentStep: 3,
    }));
  };

  const handleDateSelect = (date: Date) => {
    setBookingState((prevState) => ({
      ...prevState,
      selectedDate: date,
      selectedTimeSlot: null,
      selectedDateTime: null,
    }));

    if (selectedStylist?.id) {
      fetchAvailableTimeSlots(selectedStylist.id, date);
    }
  };

  const fetchAvailableTimeSlots = async (stylistId: string, date: Date) => {
    setLoadingState((prevState) => ({ ...prevState, loadingTimeSlots: true }));
    try {
      const response = await timeSlotsApi.getTimeSlotByStylistId(
        stylistId,
        selectedDate.toDateString()
      );

      setAvailableTimeSlots(response.items);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingState((prevState) => ({
        ...prevState,
        loadingTimeSlots: false,
      }));
    }
  };

  const handleBooking = async () => {
    try {
      if (
        selectedBranch &&
        selectedServices.length > 0 &&
        selectedDateTime &&
        selectedStylist
      ) {
        const appointmentData = {
          userId: user?.id,
          branchId: selectedBranch.id,
          serviceIds: selectedServices.map((service) => service.id),
          stylistId: selectedStylist.id,
          appointmentDate: selectedDateTime.toISOString(),
          startTime: selectedTimeSlot,
          totalAmount: getTotalPrice(),
          discountAmount: calculateDiscountAmount(),
          promotionId: selectedVoucher?.id || null,
          notes: "",
        };

        console.log("Booking appointment:", appointmentData);

        resetBookingForm();

        alert(t("appointments.booking_successful"));
        router.push("/(users)");
      } else {
        alert(t("appointments.complete_all_steps"));
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(t("appointments.booking_failed"));
    }
  };

  const resetBookingForm = () => {
    setBookingState({
      currentStep: 0,
      selectedBranch: null,
      selectedServices: [],
      selectedDateTime: null,
      selectedStylist: null,
      selectedTimeSlot: null,
      selectedDate: new Date(),
      selectedVoucher: null,
    });
  };

  const getTotalPrice = () => {
    const subtotal = selectedServices.reduce(
      (total, service) => total + (service.price || 0),
      0
    );

    return subtotal - calculateDiscountAmount();
  };

  const getSubtotalPrice = () => {
    return selectedServices.reduce(
      (total, service) => total + (service.price || 0),
      0
    );
  };

  const calculateDiscountAmount = () => {
    if (!selectedVoucher) return 0;

    const subtotal = getSubtotalPrice();

    if (selectedVoucher.discountType === "fixed") {
      return selectedVoucher.discountAmount;
    } else {
      // Percentage discount
      return Math.round(subtotal * (selectedVoucher.discountAmount / 100));
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    return `${dayNames[dayOfWeek]}, ${day < 10 ? "0" + day : day}/${
      month < 10 ? "0" + month : month
    }`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getSelectedDateString = () => {
    if (isToday(selectedDate)) {
      return `${t("appointments.today")}, ${formatDate(selectedDate)}`;
    }
    return formatDate(selectedDate);
  };

  const handleStylistSelect = useCallback((stylist: any) => {
    setBookingState((prevState) => ({
      ...prevState,
      selectedStylist: stylist,
    }));

    setBookingState((prevState) => ({
      ...prevState,
      selectedTimeSlot: null,
      selectedDateTime: null,
    }));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen />
      <View className="flex-1 bg-white">
        <Text className="text-xl font-bold text-center py-4 mt-6">
          {t("appointments.title")}
        </Text>

        <ScrollView className="flex-1">
          <View className="px-4 pb-24">
            <View className="flex-row mb-4">
              <View className="mr-3 items-center">
                <View
                  className={`h-6 w-6 rounded-full items-center justify-center ${
                    currentStep >= 0 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  {currentStep > 0 ? (
                    <Ionicons name="checkmark" size={14} color="white" />
                  ) : (
                    <Text className="text-white text-xs font-bold">1</Text>
                  )}
                </View>
                <View className="h-16 w-0.5 bg-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-primary font-bold mb-2">
                  {t("appointments.select_branch")}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setModalState((prevState) => ({
                      ...prevState,
                      branchModalVisible: true,
                    }))
                  }
                  className="bg-gray-50 rounded-md p-4 border border-gray-200"
                >
                  {selectedBranch ? (
                    <View className="flex-row items-center">
                      <Ionicons name="home-outline" size={20} color="#14296d" />
                      <Text className="text-gray-800 ml-2">
                        {selectedBranch.name}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#14296d"
                        style={{ marginLeft: "auto" }}
                      />
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons name="home-outline" size={20} color="gray" />
                      <Text className="text-gray-500 ml-2">
                        {t("appointments.select_branch")}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="gray"
                        style={{ marginLeft: "auto" }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row mb-4">
              <View className="mr-3 items-center">
                <View
                  className={`h-6 w-6 rounded-full items-center justify-center ${
                    currentStep >= 1 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  {currentStep > 1 ? (
                    <Ionicons name="checkmark" size={14} color="white" />
                  ) : (
                    <Text className="text-white text-xs font-bold">2</Text>
                  )}
                </View>
                <View className="h-48 w-0.5 bg-primary" />
              </View>
              <View className="flex-1">
                <Text
                  className={`${
                    currentStep >= 1 ? "text-primary" : "text-gray-400"
                  } font-bold mb-2`}
                >
                  {t("appointments.select_services")}
                </Text>
                {currentStep >= 1 ? (
                  <View>
                    <TouchableOpacity
                      onPress={() =>
                        setModalState((prevState) => ({
                          ...prevState,
                          serviceModalVisible: true,
                        }))
                      }
                      className="bg-gray-50 rounded-md p-4 border border-gray-200 mb-3"
                    >
                      <View className="flex-row items-center">
                        <Ionicons
                          name="cut-outline"
                          size={20}
                          color={
                            selectedServices.length > 0 ? "primary" : "gray"
                          }
                        />
                        <Text
                          className={`ml-2 ${
                            selectedServices.length > 0
                              ? "text-gray-800"
                              : "text-gray-500"
                          }`}
                        >
                          {selectedServices.length > 0
                            ? t("appointments.selected_services_count", {
                                count: selectedServices.length,
                              })
                            : t("appointments.select_services")}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={
                            selectedServices.length > 0 ? "primary" : "gray"
                          }
                          style={{ marginLeft: "auto" }}
                        />
                      </View>
                    </TouchableOpacity>

                    {selectedServices.length > 0 && (
                      <View>
                        <View className="flex-row flex-wrap">
                          {selectedServices.map((service) => (
                            <View
                              key={service.id}
                              className="bg-gray-100 rounded-md py-2 px-4 mr-3 mb-3"
                            >
                              <Text className="text-sm">{service.name}</Text>
                            </View>
                          ))}
                        </View>

                        {selectedVoucher ? (
                          <View className="mb-3">
                            <View className="flex-row items-center bg-green-50 rounded-md py-2 px-3 border border-green-200">
                              <Ionicons
                                name="ticket-outline"
                                size={16}
                                color="green"
                              />
                              <Text className="text-sm text-green-700 font-medium ml-1">
                                {selectedVoucher.code}
                              </Text>
                              <Text className="text-xs text-green-600 ml-2">
                                {selectedVoucher.description}
                              </Text>
                            </View>
                          </View>
                        ) : null}

                        <View className="space-y-1">
                          <View className="flex-row justify-between">
                            <Text className="text-base text-gray-600">
                              {t("appointments.total_price")}:
                            </Text>
                            <Text className="text-base font-medium">
                              {formatPrice(getSubtotalPrice())}
                            </Text>
                          </View>

                          {selectedVoucher && (
                            <View className="flex-row justify-between">
                              <Text className="text-base text-gray-600">
                                {t("vouchers.discount")}:
                              </Text>
                              <Text className="text-base font-medium text-green-600">
                                -{formatPrice(calculateDiscountAmount())}
                              </Text>
                            </View>
                          )}

                          {selectedVoucher && (
                            <View className="flex-row justify-between pt-1 border-t border-dashed border-gray-300">
                              <Text className="text-base font-bold text-gray-700">
                                {t("vouchers.final_price")}:
                              </Text>
                              <Text className="text-base font-bold text-primary">
                                {formatPrice(getTotalPrice())}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="bg-gray-100 rounded-md p-4">
                    <Text className="text-gray-400">
                      {t("appointments.complete_previous_step")}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="flex-row mb-4">
              <View className="mr-3 items-center">
                <View
                  className={`h-6 w-6 rounded-full items-center justify-center ${
                    currentStep >= 2 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
                <View className="h-96 w-0.5 bg-primary" />
              </View>
              <View className="flex-1">
                <Text
                  className={`${
                    currentStep >= 2 ? "text-[#14296d]" : "text-gray-400"
                  } font-bold mb-2`}
                >
                  {t("appointments.select_datetime_stylist")}
                </Text>

                {currentStep >= 2 ? (
                  <View>
                    {/* Stylist Selection */}
                    <View className="mb-3">
                      <View className="flex-row items-center mb-2">
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="#14296d"
                        />
                        <Text className="ml-2 text-gray-800 font-medium">
                          {selectedStylist
                            ? selectedStylist.firstName +
                              " " +
                              selectedStylist.lastName
                            : t("appointments.select_stylist")}
                        </Text>
                      </View>

                      {/* Horizontal scrollable list of stylists */}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="py-2"
                      >
                        {loadingStylists ? (
                          <View className="w-full py-4 items-center justify-center">
                            <Loading size="small" color={Colors.primary} />
                          </View>
                        ) : stylists.length > 0 ? (
                          stylists.map((stylist) => (
                            <TouchableOpacity
                              key={stylist.id}
                              onPress={() => handleStylistSelect(stylist)}
                              className={`mr-3 rounded-lg w-[130px] ${
                                selectedStylist?.id === stylist.id
                                  ? "border-2 border-blue-500"
                                  : "border border-gray-200"
                              }`}
                            >
                              <View className="relative">
                                {selectedStylist?.id === stylist.id && (
                                  <View className="absolute top-2 right-2 z-10 bg-blue-500 rounded-full w-6 h-6 items-center justify-center">
                                    <Ionicons
                                      name="checkmark"
                                      size={16}
                                      color="white"
                                    />
                                  </View>
                                )}

                                <View className="w-full">
                                  <Image
                                    source={
                                      stylist.image
                                        ? { uri: stylist.image }
                                        : require("@/assets/images/default-avatar.png")
                                    }
                                    className="w-full h-[120px]"
                                    resizeMode="cover"
                                  />
                                </View>

                                <View className="p-2 items-center">
                                  <Text
                                    className="text-center font-medium"
                                    numberOfLines={1}
                                  >
                                    {stylist.firstName +
                                      " " +
                                      stylist.lastName ||
                                      t("appointments.unknown_stylist")}
                                  </Text>

                                  <Text className="text-gray-500 text-sm">
                                    {t("appointments.exp") +
                                      ": " +
                                      stylist.experienceYears +
                                      " " +
                                      t("appointments.years")}
                                  </Text>
                                  {stylist.rating > 0 ? (
                                    <Text className="text-gray-500 text-sm">
                                      {stylist.rating || "4.9"}{" "}
                                      <Ionicons
                                        name="star"
                                        size={14}
                                        color="#FFD700"
                                      />
                                      <Text className="text-gray-500 text-xs ml-1">
                                        (
                                        {stylist.ratingCount +
                                          " " +
                                          t("appointments.customer")}
                                        )
                                      </Text>
                                    </Text>
                                  ) : null}
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View className="w-full items-center justify-center p-4 bg-gray-50 rounded-md">
                            <Text className="text-gray-500">
                              {t("appointments.no_stylists_available")}
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>

                    {selectedStylist && (
                      <View className="bg-gray-50 rounded-md p-4 border border-gray-200 mb-3">
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center">
                            <Ionicons
                              name="calendar-outline"
                              size={20}
                              color="#14296d"
                            />
                            <Text className="text-gray-800 ml-2">
                              {getSelectedDateString()}
                            </Text>
                          </View>
                        </View>

                        {/* Date picker - horizontal scrollable dates */}
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="mb-4"
                        >
                          {loadingSchedule ? (
                            <View className="py-2 px-4">
                              <Loading size="small" color={Colors.primary} />
                            </View>
                          ) : (
                            availableDates.map((date, index) => {
                              const dateString = formatDateString(date);
                              const dayInfo = stylistSchedule.find(
                                (day: any) => day.date === dateString
                              );
                              const isWorkingDay = dayInfo?.isWorking ?? true; // Default to true if no data

                              return (
                                <TouchableOpacity
                                  key={index}
                                  onPress={() =>
                                    isWorkingDay ? handleDateSelect(date) : null
                                  }
                                  disabled={!isWorkingDay}
                                  className={`mr-3 px-4 py-2 rounded-full ${
                                    selectedDate.getDate() === date.getDate() &&
                                    selectedDate.getMonth() === date.getMonth()
                                      ? "bg-[#14296d]"
                                      : isWorkingDay
                                      ? "bg-gray-100"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <Text
                                    className={`font-medium ${
                                      selectedDate.getDate() ===
                                        date.getDate() &&
                                      selectedDate.getMonth() ===
                                        date.getMonth()
                                        ? "text-white"
                                        : isWorkingDay
                                        ? "text-gray-700"
                                        : "text-gray-400 line-through"
                                    }`}
                                  >
                                    {isToday(date)
                                      ? t("appointments.today")
                                      : formatDate(date)}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })
                          )}
                        </ScrollView>

                        {!loadingTimeSlots && (
                          <View className="flex-row flex-wrap">
                            {availableTimeSlots.length > 0 ? (
                              availableTimeSlots.map(
                                (slot: any, index: any) => {
                                  // Convert API time format (09:00:00) to display format (9h00)
                                  const [hours, minutes] =
                                    slot.startTime.split(":");
                                  const displayTime = `${parseInt(
                                    hours
                                  )}h${minutes}`;

                                  return (
                                    <TouchableOpacity
                                      key={index}
                                      onPress={() =>
                                        slot.isAvailable
                                          ? handleTimeSlotSelect(displayTime)
                                          : null
                                      }
                                      disabled={!slot.isAvailable}
                                      className={`w-[23%] h-12 items-center justify-center m-1 border ${
                                        selectedTimeSlot === displayTime
                                          ? "border-[#14296d] bg-white"
                                          : slot.isAvailable
                                          ? "border-gray-200 bg-gray-100"
                                          : "border-gray-200 bg-gray-200"
                                      }`}
                                    >
                                      <Text
                                        className={`${
                                          selectedTimeSlot === displayTime
                                            ? "text-[#14296d] font-medium"
                                            : slot.isAvailable
                                            ? "text-gray-500"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {displayTime}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                }
                              )
                            ) : (
                              <View className="w-full py-4 items-center justify-center">
                                <Text className="text-gray-500">
                                  {t("appointments.no_time_slots")}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {loadingTimeSlots && (
                          <View className="w-full py-4 items-center justify-center">
                            <Loading size="small" color={Colors.primary} />
                          </View>
                        )}
                      </View>
                    )}

                    {/* Booking Button */}
                    {selectedTimeSlot && selectedStylist && (
                      <View className="mt-4">
                        <Button
                          title={t("appointments.confirm_booking")}
                          onPress={handleBooking}
                          buttonStyle={{ backgroundColor: "#14296d" }}
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="bg-gray-100 rounded-md p-4">
                    <Text className="text-gray-400">
                      {t("appointments.complete_previous_step")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modals */}
      <BranchesModal
        visible={branchModalVisible}
        onClose={() =>
          setModalState((prevState) => ({
            ...prevState,
            branchModalVisible: false,
          }))
        }
        onSelectBranch={handleBranchSelect}
        selectedBranch={selectedBranch}
      />

      <ServicesModal
        visible={serviceModalVisible}
        onClose={() =>
          setModalState((prevState) => ({
            ...prevState,
            serviceModalVisible: false,
          }))
        }
        onSelectServices={handleServiceSelect}
        selectedBranch={selectedBranch?.id}
        selectedServices={selectedServices}
      />
    </SafeAreaView>
  );
};

export default AppointmentsScreen;
