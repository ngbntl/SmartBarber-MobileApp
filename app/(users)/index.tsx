import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

import Carousel from "react-native-reanimated-carousel";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Icon from "@/assets/icons";
import AppointmentsApi from "@/api/appointments";
import { Appointment } from "@/types/appointments";
import {
  formatCountdown,
  formatDateTime,
  formatPrice,
  formatTime,
  formatAppointmentDate,
} from "@/utils/functions";
import ServicesApi from "@/api/services";
import BranchesApi from "@/api/branches";
import { router } from "expo-router";
import i18n from "@/lib/i18n";
import { useNotification } from "@/hooks/useNotification";
import Toast from "@/components/ui/Toast";
import RatingPromptModal from "@/components/modal/RatingPromptModal";
import useRatingPrompt from "@/hooks/useRatingPrompt";
import RatingsApi from "@/api/reviews";

const getCurrentLocale = (): string => {
  const localeMap: Record<string, string> = {
    en: "en-US",
    vi: "vi-VN",
    ja: "ja-JP",
  };
  const language = i18n.language || "en";
  return localeMap[language] || "en-US";
};

const { width } = Dimensions.get("window");
const SLIDE_WIDTH = width - 48;
const SLIDE_HEIGHT = 180;

const HomeScreen = () => {
  const { t } = useTranslation();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [services, setServices] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<any[]>([]);

  const carouselRef = useRef(null);
  const { appNotification, toast, setToast } = useNotification();

  const user = useSelector((state: RootState) => state.auth.userInfo);
  const appointmentsApi = new AppointmentsApi();
  const servicesApi = new ServicesApi();
  const branchesApi = new BranchesApi();

  // Sử dụng hook rating prompt để hiển thị thông báo đánh giá
  const {
    showPrompt,
    currentAppointment,
    handleRate,
    handleSkip,
    loadPendingRatingAppointments,
  } = useRatingPrompt();

  const fetchData = async () => {
    await Promise.all([fetchAppointments(), fetchServices(), fetchBranches()]);
  };

  const filterUpcomingAppointments = (appointments: Appointment[]) => {
    const now = new Date();
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const status = appointment.status?.toLowerCase();
      return (
        appointmentDate >= now &&
        (status === "pending" || status === "confirmed")
      );
    });
  };

  const fetchAppointments = async () => {
    try {
      if (user) {
        const appointments = await appointmentsApi.getAppointments(user.id);
        const upcoming = filterUpcomingAppointments(appointments.items || []);
        setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setUpcomingAppointments([]);
    }
  };

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
              const response = await appointmentsApi.cancelAppointment(
                appointmentId
              );
              if (response) {
                appNotification(response);
                setTimeout(() => {
                  fetchAppointments();
                }, 1000);
              }
            } catch (error: any) {
              console.error("Error canceling appointment:", error);
              appNotification(error);
            } finally {
              setCancelingId(null);
            }
          },
        },
      ]
    );
  };

  const fetchServices = async () => {
    try {
      const services = await servicesApi.getServices();
      setServices(services.items || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const fetchBranches = async () => {
    try {
      const branches = await branchesApi.getBranches();
      setBranches(branches.items || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [user])
  );

  const introSlides = [
    {
      type: "image",
      source:
        "https://i.pinimg.com/736x/2e/68/bd/2e68bd4659c0534e0fe35cdd5ffd0172.jpg",
      title: "home.slide1.title",
    },
    {
      type: "image",
      source:
        "https://i.pinimg.com/736x/f2/47/e0/f247e0ed7a3dd4ec3bd26d8592733688.jpg",
      title: "home.slide2.title",
    },
    {
      type: "ai-feature",
      colors: [Colors.primary, "#1393cd"],
      title: t("home.try_on_hair"),
      description: t("home.try_on_hair_desc"),
      buttonText: t("home.button_try_on"),
    },
    {
      type: "image",
      source:
        "https://i.pinimg.com/736x/0d/56/45/0d5645eb2158a648ac4e834825ecc909.jpg",
      title: "home.slide3.title",
    },
  ];

  const RenderIntroItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === "ai-feature") {
      return (
        <View className="h-full">
          <View className="rounded-2xl overflow-hidden relative h-full">
            <Image
              source={{ uri: "https://i.imgur.com/JQdgGsL.jpg" }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />

            {/* Dark overlay for better text readability */}
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            />

            <View className="flex-row justify-between items-center h-full p-6">
              <View className="flex-1 pr-24">
                <View className="bg-white/20 rounded-full px-3 py-1 w-16 mb-3">
                  <Text className="text-xs font-semibold text-center text-white">
                    {t("home.new")}
                  </Text>
                </View>
                <Text className="text-2xl font-bold mb-3 text-white">
                  {t(item.title)}
                </Text>
                <Text className="text-white text-sm opacity-90 mb-5 leading-5">
                  {t(item.description)}
                </Text>
                <TouchableOpacity
                  className="bg-white rounded-full py-3 px-6 shadow-md w-36 flex-row items-center justify-center"
                  activeOpacity={0.8}
                  onPress={() => {
                    try {
                      router.push("/hairTryOn");
                    } catch (error) {
                      console.error("Error navigating to hair try-on:", error);
                      if (error.message && error.message.includes("500")) {
                        appNotification({
                          message: t("hairTryOn.face_detection_error"),
                          statusCode: 500,
                        });
                      } else {
                        appNotification({
                          message: t("common.unexpected_error"),
                          statusCode: 400,
                        });
                      }
                    }
                  }}
                >
                  <Text className="font-bold text-primary mr-2">
                    {t(item.buttonText)}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View className="rounded-2xl overflow-hidden h-full">
        <Image
          source={{ uri: item.source }}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />
        <View className="absolute inset-0 bg-black/10" />
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <Text className="text-white text-lg font-bold">
            {t(item.title, "Barber")}
          </Text>
        </View>
      </View>
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setIsSearching(false);
      setFilteredServices([]);
      setFilteredBranches([]);
    } else {
      setIsSearching(true);
      const filteredSvcs = services.filter((service) =>
        service.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredServices(filteredSvcs);

      const filteredBrnchs = branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(query.toLowerCase()) ||
          branch.address?.toLowerCase().includes(query.toLowerCase()) ||
          branch.district?.toLowerCase().includes(query.toLowerCase()) ||
          branch.city?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBranches(filteredBrnchs);
    }
  };

  const handleRateStylist = async (
    appointmentId: string,
    rating: number,
    comment: string
  ) => {
    try {
      const success = await handleRate(appointmentId, rating, comment);

      if (success) {
        appNotification({
          status: "success",
          message: t("ratings.thanks_for_rating"),
        });
      }
    } catch (error) {
      appNotification({
        status: "error",
        message: t("ratings.rating_failed"),
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPendingRatingAppointments();
    }, [])
  );

  return (
    <>
      <ScreenWrapper>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}

            <View className="flex-row justify-between items-center px-6 pt-4 pb-2 mb-5">
              <View>
                <Text className="text-base text-gray-500 font-medium">
                  {t("home.welcome")},
                </Text>
                <Text className="text-2xl font-bold text-[#333]">
                  {user?.fullName}
                </Text>
              </View>
              <TouchableOpacity
                className="w-11 h-11 bg-white rounded-full shadow-md justify-center items-center"
                activeOpacity={0.7}
                onPress={() => router.push("/")}
              >
                <Icon name="noti" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-white rounded-2xl px-5 py-3 mx-6 mb-7 shadow-md">
              <Ionicons name="search-outline" size={22} color="#A0A0A0" />
              <TextInput
                className="ml-3 text-gray-700 text-base font-medium flex-1"
                placeholder={
                  t("home.search_placeholder") ||
                  "Search for services, branches..."
                }
                placeholderTextColor="#A0A0A0"
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setIsSearching(false);
                    Keyboard.dismiss();
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#A0A0A0" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {isSearching && searchQuery.trim() !== "" && (
              <View className="px-6 mb-8">
                <View className="bg-white rounded-2xl p-4 shadow-md">
                  {/* No results message */}
                  {filteredServices.length === 0 &&
                    filteredBranches.length === 0 && (
                      <View className="items-center py-8">
                        <Ionicons
                          name="search-outline"
                          size={48}
                          color="lightgray"
                        />
                        <Text className="text-center text-gray-400 mt-3">
                          {t("home.no_search_results")}
                        </Text>
                      </View>
                    )}

                  {/* Services results */}
                  {filteredServices.length > 0 && (
                    <View className="mb-4">
                      <Text className="text-lg font-bold text-gray-800 mb-3">
                        {t("home.services")} ({filteredServices.length})
                      </Text>
                      {filteredServices.slice(0, 5).map((service) => (
                        <TouchableOpacity
                          key={service.id}
                          className="flex-row items-center mb-3 p-2 border-b border-gray-100"
                          onPress={() => {
                            router.push({
                              pathname: "/(users)/serviceDetail",
                              params: { id: service.id },
                            });
                          }}
                        >
                          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                            <Ionicons
                              name="cut-outline"
                              size={22}
                              color={Colors.primary}
                            />
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-gray-800 font-medium"
                              numberOfLines={1}
                            >
                              {service.name}
                            </Text>
                            <Text className="text-primary text-sm">
                              {formatPrice(service.price)}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="gray"
                          />
                        </TouchableOpacity>
                      ))}
                      {filteredServices.length > 5 && (
                        <TouchableOpacity
                          className="p-2 items-center"
                          onPress={() => {
                            setSearchQuery("");
                            setIsSearching(false);
                            router.push("/appointments");
                          }}
                        >
                          <Text className="text-primary font-medium">
                            {t("home.view_all_services")} (
                            {filteredServices.length})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Branches results */}
                  {filteredBranches.length > 0 && (
                    <View>
                      <Text className="text-lg font-bold text-gray-800 mb-3">
                        {t("home.branches")} ({filteredBranches.length})
                      </Text>
                      {filteredBranches.slice(0, 3).map((branch) => (
                        <TouchableOpacity
                          key={branch.id}
                          className="flex-row items-center mb-3 p-2 border-b border-gray-100"
                          onPress={() => {
                            // Navigate to branch detail or booking page
                            router.push({
                              pathname: "/appointments",
                              params: { branchId: branch.id },
                            });
                          }}
                        >
                          <View className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                            {branch.image ? (
                              <Image
                                source={{ uri: branch.image }}
                                className="w-full h-full"
                                style={{ resizeMode: "cover" }}
                              />
                            ) : (
                              <View className="w-full h-full bg-primary/10 items-center justify-center">
                                <Ionicons
                                  name="location-outline"
                                  size={20}
                                  color={Colors.primary}
                                />
                              </View>
                            )}
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-gray-800 font-medium"
                              numberOfLines={1}
                            >
                              {branch.name}
                            </Text>
                            <Text
                              className="text-gray-500 text-xs"
                              numberOfLines={1}
                            >
                              {branch.address}, {branch.district}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="gray"
                          />
                        </TouchableOpacity>
                      ))}
                      {filteredBranches.length > 3 && (
                        <TouchableOpacity
                          className="p-2 items-center"
                          onPress={() => {
                            setSearchQuery("");
                            setIsSearching(false);
                            router.push("/appointments");
                          }}
                        >
                          <Text className="text-primary font-medium">
                            {t("home.view_all_branches")} (
                            {filteredBranches.length})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}

            {!isSearching && (
              <View className="mb-8 px-6">
                <Carousel
                  ref={carouselRef}
                  loop
                  width={SLIDE_WIDTH}
                  height={SLIDE_HEIGHT}
                  autoPlay={true}
                  data={introSlides}
                  scrollAnimationDuration={1000}
                  autoPlayInterval={3000}
                  onSnapToItem={(index) => setActiveIndex(index)}
                  renderItem={({ item, index }) => (
                    <RenderIntroItem item={item} index={index} />
                  )}
                  mode="parallax"
                  modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                  }}
                />
              </View>
            )}

            {!isSearching && (
              <>
                {/* Upcoming Appointments */}
                <View className="mb-8 px-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-[#333]">
                      {t("home.upcoming")}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push("/(users)/appointments")}
                    >
                      <Text className="text-primary font-medium">
                        {t("common.see_all")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {upcomingAppointments.length > 0 ? (
                    <View>
                      {upcomingAppointments.slice(0, 3).map((appointment) => (
                        <TouchableOpacity
                          key={appointment.id}
                          className="bg-white rounded-2xl p-4 mb-4"
                          activeOpacity={0.7}
                          onPress={() =>
                            router.push({
                              pathname: "/(users)/appointments",
                              params: { selected: appointment.id },
                            })
                          }
                        >
                          <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-row items-center">
                              <View className="w-10 h-10 bg-primary/10 rounded-full justify-center items-center mr-3">
                                <Icon
                                  name="calendar"
                                  size={20}
                                  color={Colors.primary}
                                />
                              </View>
                              <View>
                                <Text className="font-bold text-base text-[#333]">
                                  {new Date(
                                    appointment.appointmentDate
                                  ).toLocaleDateString(getCurrentLocale(), {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                  {appointment.startTime?.substring(0, 5) ||
                                    formatTime(appointment.appointmentDate)}
                                </Text>
                              </View>
                            </View>
                            <View className="bg-primary/10 rounded-full px-3 py-1">
                              <Text className="text-xs text-primary font-medium capitalize">
                                {t(
                                  `appointment_status.${appointment.status.toLowerCase()}`
                                )}
                              </Text>
                            </View>
                          </View>

                          <View className="mb-3">
                            <View className="flex-row items-center mb-1">
                              <Ionicons
                                name="location-outline"
                                size={14}
                                color={Colors.primary}
                              />
                              <Text
                                className="text-gray-700 text-sm ml-1.5"
                                numberOfLines={1}
                              >
                                {appointment.branchName ||
                                  "Branch not specified"}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <Ionicons
                                name="person-outline"
                                size={14}
                                color={Colors.primary}
                              />
                              <Text className="text-gray-700 text-sm ml-1.5">
                                {appointment.stylistName ||
                                  "Stylist not assigned"}
                              </Text>
                            </View>
                          </View>

                          {/* Services */}
                          {appointment.services &&
                          appointment.services.length > 0 ? (
                            <View className="mb-2">
                              <Text className="text-xs text-gray-500 mb-1">
                                {t("appointments.selected_services")}:
                              </Text>
                              {appointment.services.map(
                                (serviceItem, index) => (
                                  <View
                                    key={serviceItem.id}
                                    className="flex-row justify-between mb-1"
                                  >
                                    <Text
                                      className="text-sm text-gray-700"
                                      numberOfLines={1}
                                      style={{ width: "70%" }}
                                    >
                                      {serviceItem.service?.name ||
                                        "Unknown service"}
                                    </Text>
                                    <Text className="text-sm text-gray-700 font-medium">
                                      {formatPrice(
                                        parseFloat(serviceItem.price || "0")
                                      )}
                                    </Text>
                                  </View>
                                )
                              )}
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
                              <Ionicons
                                name="time-outline"
                                size={14}
                                color="#f97316"
                              />
                              <Text className="text-orange-500 font-medium ml-1 text-sm">
                                {appointment.durationMinutes
                                  ? `${Math.floor(
                                      appointment.durationMinutes / 60
                                    )}h ${appointment.durationMinutes % 60}m`
                                  : formatCountdown(
                                      appointment.appointmentDate
                                    )}
                              </Text>
                            </View>
                            <Text className="font-bold text-primary">
                              {formatPrice(
                                parseFloat(appointment.finalAmount || "0")
                              )}
                            </Text>
                          </View>

                          <TouchableOpacity
                            className="mt-3 py-2 px-4 border border-red-500 rounded-lg self-end"
                            onPress={() =>
                              handleCancelAppointment(appointment.id)
                            }
                            disabled={cancelingId === appointment.id}
                          >
                            <Text className="text-red-500 font-medium text-sm">
                              {cancelingId === appointment.id
                                ? t("common.loading")
                                : t("appointments.cancel_appointment")}
                            </Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}

                      {upcomingAppointments.length > 0 &&
                        upcomingAppointments.length > 3 && (
                          <TouchableOpacity
                            className="items-center py-3"
                            onPress={() => router.push("/(users)/appointments")}
                          >
                            <Text className="text-primary font-medium">
                              {t("home.view_all")} (
                              {upcomingAppointments.length})
                            </Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  ) : (
                    <View className="bg-white rounded-2xl p-6 items-center justify-center">
                      <Ionicons
                        name="calendar-outline"
                        size={40}
                        color="lightgray"
                      />
                      <Text className="text-gray-500 mt-3 mb-3 text-center">
                        {t("appointments.no_appointments")}
                      </Text>
                      <TouchableOpacity
                        className="mt-2 bg-primary py-2 px-6 rounded-lg"
                        onPress={() => router.push("/(users)/appointments")}
                      >
                        <Text className="text-white font-medium">
                          {t("home.book_now")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Services */}
                <View className="mb-8">
                  <View className="flex-row justify-between items-center px-6 mb-4">
                    <Text className="text-xl font-bold text-[#333]">
                      {t("home.services")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/appointments")}
                      className="bg-primary/10 px-4 py-1.5 rounded-full"
                    >
                      <Text className="text-sm font-medium text-primary">
                        {t("home.book_now")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingLeft: 24,
                      paddingRight: 16,
                    }}
                  >
                    {services.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        className="w-[260px] bg-white rounded-2xl mr-4 overflow-hidden shadow-md"
                        activeOpacity={0.7}
                        onPress={() => {
                          router.push({
                            pathname: "/(users)/serviceDetail",
                            params: { id: item.id },
                          });
                        }}
                      >
                        {item.image ? (
                          <Image
                            source={{ uri: item.image }}
                            className="w-full h-[140px]"
                            style={{ resizeMode: "cover" }}
                          />
                        ) : (
                          <Image
                            source={require("@/assets/images/not-found.png")}
                            className="w-full h-[140px]"
                            style={{ resizeMode: "cover" }}
                          />
                        )}

                        <View className="p-4">
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1 pr-2">
                              <Text className="text-lg font-bold text-[#333] mb-1">
                                {item.name}
                              </Text>

                              <Text className="text-sm text-primary mb-3">
                                {formatPrice(item.price)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Branches */}
                <View className="mb-8">
                  <View className="flex-row justify-between items-center px-6 mb-4">
                    <Text className="text-xl font-bold text-[#333]">
                      {t("home.branches")}
                    </Text>
                  </View>

                  <View className="px-6">
                    {branches.length > 0
                      ? branches.slice(0, 3).map((branch) => (
                          <TouchableOpacity
                            key={branch.id}
                            className="bg-white rounded-2xl mb-4 overflow-hidden shadow-md"
                            activeOpacity={0.7}
                          >
                            <View className="flex-row">
                              <View className="w-[110px] h-[110px] overflow-hidden">
                                {branch.image ? (
                                  <Image
                                    source={{ uri: branch.image }}
                                    className="w-full h-full"
                                    style={{ resizeMode: "cover" }}
                                  />
                                ) : (
                                  <View className="w-full h-full bg-gray-200 justify-center items-center">
                                    <Ionicons
                                      name="cut-outline"
                                      size={30}
                                      color="#888"
                                    />
                                  </View>
                                )}
                              </View>

                              <View className="flex-1 p-3">
                                <View>
                                  <Text
                                    className="text-base font-bold text-[#333] mb-1"
                                    numberOfLines={1}
                                  >
                                    {branch.name}
                                  </Text>

                                  <View className="flex-row items-center mb-1">
                                    <Ionicons
                                      name="location-outline"
                                      size={14}
                                      color={Colors.primary}
                                    />
                                    <Text
                                      className="ml-1 text-xs text-primary"
                                      numberOfLines={1}
                                    >
                                      {branch.address}, {branch.district},{" "}
                                      {branch.city}
                                    </Text>
                                  </View>

                                  <View className="flex-row items-center justify-between mt-2">
                                    <View className="flex-row items-center">
                                      <Ionicons
                                        name="time-outline"
                                        size={14}
                                        color={Colors.primary}
                                      />
                                      <Text className="ml-1 text-xs text-primary">
                                        {branch.openTime} - {branch.closeTime}
                                      </Text>
                                    </View>
                                  </View>
                                  <View className="flex-row items-center justify-between mt-2">
                                    <View className="flex-row items-center">
                                      <Ionicons
                                        name="star"
                                        size={14}
                                        color="#FFD700"
                                      />
                                      <Text className="ml-1 text-xs text-primary font-medium">
                                        {branch.rating > 0
                                          ? branch.rating
                                          : t("home.new")}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))
                      : null}
                  </View>
                </View>
              </>
            )}

            {/* Bottom padding */}
            <View className="h-8" />
          </ScrollView>
        </TouchableWithoutFeedback>
      </ScreenWrapper>

      {/* Rating Prompt Modal */}
      <RatingPromptModal
        visible={showPrompt}
        appointment={currentAppointment}
        onClose={handleSkip}
        onRate={handleRateStylist}
        onSkip={handleSkip}
      />
    </>
  );
};

const Home = HomeScreen;
export default Home;
