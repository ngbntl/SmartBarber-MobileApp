import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Share,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import ServicesApi from "@/api/services";
import { Service } from "@/types/services";
import { formatPrice } from "@/utils/functions";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const ServiceDetail = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const servicesApi = new ServicesApi();

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error("Service ID is required");
        }

        const response = await servicesApi.getServiceById(id);
        setService(response);
      } catch (error) {
        console.error("Error fetching service details:", error);
        setError(t("common.error_loading_data"));
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [id]);

  const handleShare = async () => {
    if (!service) return;

    try {
      await Share.share({
        message: `${t("share.check_service")} ${service.name} - ${formatPrice(
          service.price
        )}`,
        title: service.name,
      });
    } catch (error) {
      console.error("Error sharing service:", error);
    }
  };

  const handleBookNow = () => {
    router.push({
      pathname: "/appointments",
      params: { serviceId: id },
    });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-500">{t("common.loading")}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !service) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={60} color="gray" />
          <Text className="text-xl font-bold text-gray-700 mt-4 text-center">
            {t("common.something_went_wrong")}
          </Text>
          <Text className="text-gray-500 mt-2 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-primary rounded-full px-8 py-3"
          >
            <Text className="text-white font-medium">
              {t("common.go_back")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header Image */}
        <View className="relative w-full h-[300px]">
          {service.image ? (
            <Image
              source={{ uri: service.image }}
              className="w-full h-full"
              style={{ resizeMode: "cover" }}
            />
          ) : (
            <View className="w-full h-full bg-gray-200 justify-center items-center">
              <Ionicons name="cut-outline" size={60} color="#888" />
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.replace("/(users)")}
            className="absolute top-12 left-6 bg-white rounded-full p-2.5 shadow-md"
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity
            onPress={handleShare}
            className="absolute top-12 right-6 bg-white rounded-full p-2.5 shadow-md"
          >
            <Ionicons name="share-social-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Service Details */}
        <View className="px-6 py-6 bg-white rounded-t-3xl -mt-5">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {service.name}
              </Text>
              <Text className="text-lg font-semibold text-primary">
                {formatPrice(service.price)}
              </Text>
            </View>
            <View className="bg-primary/10 rounded-lg px-3 py-1.5 flex-row items-center">
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text className="ml-1 text-primary font-medium">
                {service.duration} {t("common.min")}
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              {t("service.description")}
            </Text>
            <Text className="text-gray-600 leading-6">
              {service.description || t("service.no_description")}
            </Text>
          </View>

          {/* Additional notes */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              {t("service.additional_notes")}
            </Text>
            <Text className="text-gray-600">
              {t("service.additional_notes_content")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleBookNow}
            className="bg-primary py-4 rounded-xl mb-8"
          >
            <Text className="text-white text-center font-bold text-lg">
              {t("service.book_now")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ServiceDetail;
