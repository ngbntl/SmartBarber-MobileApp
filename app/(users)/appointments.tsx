import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  FlatList,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";

import BranchesModal from "../../components/modal/branchesModal";
import ServicesModal from "../../components/modal/servicesModal";
import BookingConfirmationModal from "../../components/modal/bookingConfirmationModal";
import AppointmentCard from "@/components/ui/AppointmentCard";
import Toast from "@/components/ui/Toast";

import { Service } from "../../types/services";
import { Branch } from "@/types/branch";
import { Appointment } from "@/types/appointments";
import {
  formatPrice,
  formatDate,
  formatAppointmentDate,
  formatShortDate,
  formatTimeSlot,
  isToday,
} from "@/utils/functions";
import StylistApi from "@/api/stylist";
import Loading from "@/components/ui/Loading";
import { Colors } from "@/constants/Colors";
import TimeSlotsApi from "@/api/time-slots";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import AppointmentsApi from "@/api/appointments";
import { useNotification } from "@/hooks/useNotification";
import i18n from "@/lib/i18n";
import RatingsApi from "@/api/reviews";
import ReviewApi from "@/api/reviews";

const getCurrentLocale = (): string => {
  const localeMap: Record<string, string> = {
    en: "en-US",
    vi: "vi-VN",
    ja: "ja-JP",
  };
  const language = i18n.language || "en";
  return localeMap[language] || "en-US";
};

interface Voucher {
  id: string;
  name: string;
  code: string;
  description: string;
  discountAmount: number;
  discountPercent: number;
  isPercentage: boolean;
  minimumPurchaseAmount: number;
  isActive: boolean;
  endDate: string;
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

enum TabType {
  BOOKING = "booking",
  HISTORY = "history",
}

const AppointmentsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.BOOKING);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const { appNotification, toast, setToast } = useNotification();

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
    confirmationModalVisible: false,
  });
  const {
    branchModalVisible,
    serviceModalVisible,
    datetimeModalVisible,
    confirmationModalVisible,
  } = modalState;
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

  const [ratingInProgress, setRatingInProgress] = useState<string | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

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
    return formatShortDate(date, "-", true);
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
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const response = await timeSlotsApi.getTimeSlotByStylistId(
        stylistId,
        formattedDate
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

  const handleBooking = () => {
    if (
      selectedBranch &&
      selectedServices.length > 0 &&
      selectedDateTime &&
      selectedStylist
    ) {
      setModalState((prevState) => ({
        ...prevState,
        confirmationModalVisible: true,
      }));
    } else {
      alert(t("appointments.complete_all_steps"));
    }
  };

  const confirmBooking = async () => {
    try {
      setIsBookingLoading(true);

      let formattedStartTime = "";
      if (selectedTimeSlot) {
        const [hours, minutes] = selectedTimeSlot.split("h");
        const paddedHours = hours.padStart(2, "0");
        const paddedMinutes = (minutes || "00").padStart(2, "0");
        formattedStartTime = `${paddedHours}:${paddedMinutes}`;
      }

      const appointmentData = {
        userId: user?.id,
        branchId: selectedBranch?.id,
        serviceIds: selectedServices.map((service) => service.id),
        stylistId: selectedStylist?.id,
        appointmentDate: selectedDateTime?.toISOString(),
        startTime: formattedStartTime,
        totalAmount: getTotalPrice(),
        discountAmount: calculateDiscountAmount(),
        promotionId: selectedVoucher?.id || null,
        notes: "",
      };

      const appointmentApi = new AppointmentsApi();

      const res = await appointmentApi.createAppointment(appointmentData);
      if (res) {
        setModalState((prevState) => ({
          ...prevState,
          confirmationModalVisible: false,
        }));
        appNotification(res);
        resetBookingForm();

        setTimeout(() => {
          router.push("/(users)");
        }, 1500);
      } else {
        alert(t("appointments.booking_failed"));
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(t("appointments.booking_failed"));
    } finally {
      setIsBookingLoading(false);
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

    if (selectedVoucher.isPercentage === false) {
      return selectedVoucher.discountAmount;
    } else {
      return Math.round(subtotal * (selectedVoucher.discountPercent / 100));
    }
  };

  const getSelectedDateString = () => {
    if (isToday(selectedDate)) {
      return `${t("appointments.today")}, ${formatAppointmentDate(
        selectedDate
      )}`;
    }
    return formatAppointmentDate(selectedDate);
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

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      t("appointments.cancel_appointment"),
      t("appointments.cancel_confirmation"),
      [
        {
          text: t("common.no"),
          style: "cancel",
        },
        {
          text: t("common.yes"),
          style: "destructive",
          onPress: async () => {
            try {
              setCancelingId(appointmentId);
              const appointmentApi = new AppointmentsApi();
              const response = await appointmentApi.cancelAppointment(
                appointmentId
              );

              if (response) {
                appNotification(response);
                fetchAppointments();
              }
            } catch (error: any) {
              appNotification(error);
            } finally {
              setCancelingId(null);
            }
          },
        },
      ]
    );
  };

  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingAppointments(true);
    try {
      const appointmentApi = new AppointmentsApi();
      const response = await appointmentApi.getAppointments(user.id);
      setAppointments(response.items || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === TabType.HISTORY) {
      fetchAppointments();
    }
  }, [activeTab, fetchAppointments]);

  const handleRateStylist = async (
    appointmentId: string,
    rating: number,
    comment: string
  ) => {
    try {
      setRatingInProgress(appointmentId);

      const ratingData = {
        appointmentId: appointmentId,
        rating: rating,
        comment: comment,
      };

      const reviewApi = new ReviewApi();
      const response = await reviewApi.createReview(ratingData);

      if (response) {
        appNotification(response);
        fetchAppointments();
      }
    } catch (error: any) {
      console.error("Error submitting rating:", error);
    } finally {
      setRatingInProgress(null);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <SafeAreaView edges={["top"]} className="bg-white mt-14">
        <View className="flex-row items-center justify-between px-4 py-1.5 border-b border-[#f0f0f0]">
          <TouchableOpacity className="p-1.5" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text className="text-base font-bold">Lịch hẹn</Text>
          <View className="w-8" />
        </View>
      </SafeAreaView>

      <View className="flex-row border-b border-gray-200 mx-4 mb-2">
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === TabType.BOOKING ? "border-b-2 border-primary" : ""
          }`}
          onPress={() => setActiveTab(TabType.BOOKING)}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === TabType.BOOKING ? "text-primary" : "text-gray-500"
            }`}
          >
            {t("appointments.booking_tab")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === TabType.HISTORY ? "border-b-2 border-primary" : ""
          }`}
          onPress={() => setActiveTab(TabType.HISTORY)}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === TabType.HISTORY ? "text-primary" : "text-gray-500"
            }`}
          >
            {t("appointments.history_tab")}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === TabType.BOOKING ? (
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
                                {selectedVoucher.name}
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
                                      stylist.avatar
                                        ? { uri: stylist.avatar }
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
                              color="Color.primary"
                            />
                            <Text className="text-gray-800 ml-2">
                              {getSelectedDateString()}
                            </Text>
                          </View>
                        </View>

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

                              const dayName = date.toLocaleDateString(
                                getCurrentLocale(),
                                { weekday: "short" }
                              );

                              return (
                                <TouchableOpacity
                                  key={index}
                                  onPress={() =>
                                    isWorkingDay ? handleDateSelect(date) : null
                                  }
                                  disabled={!isWorkingDay}
                                  className={`mr-3 px-4 py-2 rounded-xl ${
                                    selectedDate.getDate() === date.getDate() &&
                                    selectedDate.getMonth() === date.getMonth()
                                      ? "bg-primary"
                                      : isWorkingDay
                                      ? "bg-gray-100"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <View className="items-center">
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
                                    <Text
                                      className={`text-xs mt-1 ${
                                        selectedDate.getDate() ===
                                          date.getDate() &&
                                        selectedDate.getMonth() ===
                                          date.getMonth()
                                          ? "text-white opacity-80"
                                          : isWorkingDay
                                          ? "text-gray-500"
                                          : "text-gray-400 line-through"
                                      }`}
                                    >
                                      {dayName}
                                    </Text>
                                  </View>
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
                                  const displayTime = formatTimeSlot(
                                    slot.startTime
                                  );

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
                                          ? "border-primary bg-white"
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
      ) : (
        <View className="flex-1 px-4">
          {isLoadingAppointments ? (
            <View className="flex-1 items-center justify-center">
              <Loading size="large" color={Colors.primary} />
            </View>
          ) : appointments.length > 0 ? (
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AppointmentCard
                  appointment={item}
                  onCancel={handleCancelAppointment}
                  cancelingId={cancelingId}
                  onRate={handleRateStylist}
                />
              )}
              contentContainerStyle={{ paddingVertical: 16 }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="calendar-outline" size={64} color="lightgray" />
              <Text className="text-gray-500 mt-4 text-center">
                {t("appointments.no_appointments")}
              </Text>
              <TouchableOpacity
                className="mt-4 bg-primary py-3 px-6 rounded-md"
                onPress={() => setActiveTab(TabType.BOOKING)}
              >
                <Text className="text-white font-medium">
                  {t("appointments.book_now")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {activeTab === TabType.BOOKING &&
        currentStep >= 3 &&
        selectedDateTime &&
        selectedStylist && (
          <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 border-t border-gray-200">
            <TouchableOpacity
              className="bg-primary py-4 px-6 rounded-xl items-center"
              onPress={handleBooking}
            >
              <Text className="text-white font-bold text-base">
                {t("appointments.confirm_booking")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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

      <BookingConfirmationModal
        visible={confirmationModalVisible}
        onClose={() =>
          setModalState((prevState) => ({
            ...prevState,
            confirmationModalVisible: false,
          }))
        }
        onConfirm={confirmBooking}
        isLoading={isBookingLoading}
        appointmentData={{
          branch: selectedBranch,
          services: selectedServices,
          dateTime: selectedDateTime,
          stylist: selectedStylist,
          totalPrice: getTotalPrice(),
          discountAmount: calculateDiscountAmount(),
          voucher: selectedVoucher,
        }}
      />
    </View>
  );
};

export default AppointmentsScreen;
