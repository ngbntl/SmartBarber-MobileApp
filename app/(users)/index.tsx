import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Pagination from "@/components/ui/Pagination";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Icon from "@/assets/icons";
import AppointmentsApi from "@/api/appointments";
import { Appointment } from "@/types/appointments";
import {
  formatAppointmentDate,
  formatCountdown,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
} from "@/utils/functions";
const { width } = Dimensions.get("window");
const SLIDE_WIDTH = width - 55;

const HomeScreen = () => {
  const { t } = useTranslation();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);

  const flatListRef = useAnimatedRef<Animated.ScrollView>();
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);

  const user = useSelector((state: RootState) => state.auth.userInfo);
  const appointmentsApi = new AppointmentsApi();

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

    fetchAppointments();
  }, [user]);

  const introSlides = [
    {
      id: 1,
      title: "Medical Consultations",
      description:
        "Connect with specialists for online consultations anytime, anywhere",
      image: require("@/assets/images/logo.png"),
      color: "#4FADE0",
    },
    {
      id: 2,
      title: "Book Appointments",
      description: "Schedule appointments with top healthcare providers",
      image: require("@/assets/images/logo.png"),
      color: "#FF9500",
    },
    {
      id: 3,
      title: "Health Records",
      description: "Access your medical history and test results securely",
      image: require("@/assets/images/logo.png"),
      color: "#FF2D55",
    },
  ];

  const featuredContent = [
    {
      id: 1,
      title: "Health Tips for Summer",
      image: require("@/assets/images/logo.png"),
    },
    {
      id: 2,
      title: "New Services Available",
      image: require("@/assets/images/logo.png"),
    },
  ];

  // Auto-scrolling functionality
  useEffect(() => {
    const slideTimer = setInterval(() => {
      if (flatListRef.current && flatListIndex.value < introSlides.length - 1) {
        flatListIndex.value = flatListIndex.value + 1;
        flatListRef.current.scrollTo({
          x: flatListIndex.value * SLIDE_WIDTH,
          animated: true,
        });
      } else if (flatListRef.current) {
        flatListIndex.value = 0;
        flatListRef.current.scrollTo({
          x: 0,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(slideTimer);
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  // Render each intro slide item with animations
  const RenderIntroItem = ({
    item,
    index,
  }: {
    item: {
      id: number;
      title: string;
      description: string;
      image: any;
      color: string;
    };
    index: number;
  }) => {
    const imageAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SLIDE_WIDTH,
          index * SLIDE_WIDTH,
          (index + 1) * SLIDE_WIDTH,
        ],
        [0, 1, 0],
        Extrapolate.CLAMP
      );

      const scaleAnimation = interpolate(
        x.value,
        [
          (index - 1) * SLIDE_WIDTH,
          index * SLIDE_WIDTH,
          (index + 1) * SLIDE_WIDTH,
        ],
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );

      return {
        opacity: opacityAnimation,
        transform: [{ scale: scaleAnimation }],
      };
    });

    const textAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SLIDE_WIDTH,
          index * SLIDE_WIDTH,
          (index + 1) * SLIDE_WIDTH,
        ],
        [0, 1, 0],
        Extrapolate.CLAMP
      );

      const translateYAnimation = interpolate(
        x.value,
        [
          (index - 1) * SLIDE_WIDTH,
          index * SLIDE_WIDTH,
          (index + 1) * SLIDE_WIDTH,
        ],
        [20, 0, 20],
        Extrapolate.CLAMP
      );

      return {
        opacity: opacityAnimation,
        transform: [{ translateY: translateYAnimation }],
      };
    });

    return (
      <View
        className="rounded-2xl overflow-hidden mr-5 h-[180px] flex-row items-center p-5 shadow-md"
        style={{ backgroundColor: item.color, width: SLIDE_WIDTH }}
      >
        <Animated.Image
          source={item.image}
          className="w-20 h-20 resize-contain"
          style={imageAnimationStyle}
        />
        <Animated.View className="flex-1 pl-5" style={textAnimationStyle}>
          <Text className="text-lg font-bold text-white mb-2 shadow-sm">
            {item.title}
          </Text>
          <Text className="text-sm text-white/90 leading-5">
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg="#F9FAFE">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center px-5 mb-5">
          <View>
            <Text className="text-base text-[#666]">{t("home.welcome")},</Text>
            <Text className="text-2xl font-bold text-[#333]">
              {user?.firstName + " " + user?.lastName}
            </Text>
          </View>
          <TouchableOpacity className="p-1">
            <Icon name="noti" size={35} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity className="flex-row items-center bg-white rounded-xl px-4 py-3 mx-5 mb-5 shadow-sm">
          <Ionicons name="search-outline" size={20} color="#A0A0A0" />
          <Text className="ml-2.5 text-[#A0A0A0] text-sm">
            {t("Search for services")}
          </Text>
        </TouchableOpacity>

        {/* Introduction Slider */}
        <View className="mb-5 px-5">
          <Text className="text-lg font-bold text-[#333] mb-4">
            {t("Our Services")}
          </Text>
          <View>
            <Animated.ScrollView
              ref={flatListRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={width - 40}
              snapToAlignment="center"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {introSlides.map((item, index) => (
                <RenderIntroItem key={item.id} item={item} index={index} />
              ))}
            </Animated.ScrollView>

            <View className="flex-row justify-center items-center mt-4 h-5">
              <Pagination data={introSlides} x={x} screenWidth={width - 40} />
            </View>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View className="mb-5 px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-[#333]">
              {t("home.upcoming")}
            </Text>
            <TouchableOpacity>
              <Text className="text-sm text-primary">{t("home.view_all")}</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length > 0
            ? upcomingAppointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  className="flex-row items-center bg-white rounded-xl p-4 mb-2.5 shadow-sm"
                >
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-[#333] mb-1">
                      {formatCountdown(appointment.appointmentDate)}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-lg justify-center items-center mr-1">
                        <Icon name="scissors" size={16} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg text-[#666] mb-1">
                          {appointment.stylistName}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-lg justify-center items-center mr-1">
                        <Icon name="calendar" size={16} />
                      </View>{" "}
                      <View className="flex-1">
                        <Text className="text-md text-[#666] ml-1">
                          {formatDateTime(appointment.appointmentDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            : null}
        </View>

        {/* Featured Content */}
        <View className="mb-5 px-5">
          <Text className="text-lg font-bold text-[#333] mb-4">
            {t("Featured")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-ml-5 pl-5"
          >
            {featuredContent.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-[280px] bg-white rounded-xl mr-4 overflow-hidden shadow-sm"
              >
                <Image
                  source={item.image}
                  className="w-full h-[130px] resize-cover"
                />
                <View className="p-4">
                  <Text className="text-base font-medium text-[#333] mb-1">
                    {item.title}
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-sm text-primary">
                      {t("Read More")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom padding */}
        <View className="h-5" />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HomeScreen;
