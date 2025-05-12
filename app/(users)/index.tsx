import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";

import Carousel from "react-native-reanimated-carousel";
import React, { useEffect, useState, useRef } from "react";
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
} from "@/utils/functions";
import ServicesApi from "@/api/services";
import BranchesApi from "@/api/branches";
import { router } from "expo-router";

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
  const carouselRef = useRef(null);

  const user = useSelector((state: RootState) => state.auth.userInfo);
  const appointmentsApi = new AppointmentsApi();
  const servicesApi = new ServicesApi();
  const branchesApi = new BranchesApi();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user) {
          const appointments = await appointmentsApi.getAppointments(user.id);
          setUpcomingAppointments(appointments.items || []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setUpcomingAppointments([]);
      }
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

    fetchAppointments();
    fetchServices();
    fetchBranches();
  }, [user]);

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
            {/* Use image as background instead of LinearGradient */}
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
                    router.push("/");
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

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2 mb-5">
          <View>
            <Text className="text-base text-gray-500 font-medium">
              {t("home.welcome")},
            </Text>
            <Text className="text-2xl font-bold text-[#333]">
              {user?.firstName}
            </Text>
          </View>
          <TouchableOpacity
            className="w-11 h-11 bg-white rounded-full shadow-md justify-center items-center"
            activeOpacity={0.7}
            onPress={() => router.push("/notifications")}
          >
            <Icon name="noti" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          className="flex-row items-center bg-white rounded-2xl px-5 py-4 mx-6 mb-7 shadow-md"
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={22} color="#A0A0A0" />
          <Text className="ml-3 text-[#A0A0A0] text-base font-medium">
            {t("Search for services")}
          </Text>
        </TouchableOpacity>

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
          {/* <View className="flex-row justify-center items-center mt-4 h-5">
            {introSlides.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${
                  index === activeIndex ? "bg-primary w-4" : "bg-gray-300"
                }`}
              />
            ))}
          </View> */}
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          <View className="mb-8 px-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-[#333]">
                {t("home.upcoming")}
              </Text>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-primary">
                  {t("home.view_all")}
                </Text>
              </TouchableOpacity>
            </View>

            {upcomingAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                className="flex-row items-center bg-white rounded-2xl p-5 mb-3 shadow-md"
                activeOpacity={0.7}
              >
                <View className="w-14 h-14 bg-primary/10 rounded-xl justify-center items-center mr-4">
                  <Icon name="scissors" size={24} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-[#333] mb-1">
                    {formatCountdown(appointment.appointmentDate)}
                  </Text>
                  <Text className="text-base text-[#666] mb-1">
                    {appointment.stylistName}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Icon name="calendar" size={14} color="#888" />
                    <Text className="ml-2 text-sm text-[#888]">
                      {formatDateTime(appointment.appointmentDate)}
                    </Text>
                  </View>
                </View>
                <View className="ml-2">
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

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
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 16 }}
          >
            {services.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-[260px] bg-white rounded-2xl mr-4 overflow-hidden shadow-md"
                activeOpacity={0.7}
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
                              {branch.address}, {branch.district}, {branch.city}
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
                              <Ionicons name="star" size={14} color="#FFD700" />
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

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HomeScreen;
