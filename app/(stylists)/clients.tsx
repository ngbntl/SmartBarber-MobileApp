import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Colors } from "@/constants/Colors";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import ReviewApi from "@/api/reviews";
import { formatPrice } from "@/utils/functions";
import { format } from "date-fns";

interface Review {
  id: string;
  userName: string;
  userId: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  appointmentId: string;
  serviceIds?: string[];
  serviceNames?: string[];
}

const ReviewsScreen = () => {
  const router = useRouter();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null); // null = all ratings

  // Fetch reviews data
  const fetchReviews = useCallback(async () => {
    if (!userInfo?.id) return;

    try {
      setLoading(true);
      const reviewApi = new ReviewApi();
      const response = await reviewApi.getReviews(userInfo.id);

      const reviewsData = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
        ? response
        : [];

      // Sort reviews by date (newest first)
      reviewsData.sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo?.id]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredReviews(reviews);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = reviews.filter(
      (review) =>
        review.userName.toLowerCase().includes(query) ||
        (review.comment && review.comment.toLowerCase().includes(query))
    );
    setFilteredReviews(filtered);
  }, [searchQuery, reviews]);

  // Get average rating
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  // Get rating count by star
  const getRatingCount = (star: number) => {
    return reviews.filter((review) => review.rating === star).length;
  };

  // Get rating percentage
  const getRatingPercentage = (star: number) => {
    if (reviews.length === 0) return 0;
    return (getRatingCount(star) / reviews.length) * 100;
  };

  // Filter by rating
  const handleFilterRating = (rating: number | null) => {
    setFilterRating(rating);
  };

  // Filter by rating
  useEffect(() => {
    if (filterRating === null) {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(
        (review) => review.rating === filterRating
      );
      setFilteredReviews(filtered);
    }
  }, [filterRating, reviews]);

  // Refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, [fetchReviews]);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [fetchReviews])
  );

  // Render review item
  const renderReviewItem = ({ item }: { item: Review }) => {
    return (
      <View
        className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Image
              source={
                item.avatar
                  ? { uri: item.avatar }
                  : require("@/assets/images/default-avatar.png")
              }
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text className="text-base font-semibold text-gray-800">
                {item.userName}
              </Text>
              <Text className="text-xs text-gray-500">
                {item.createdAt
                  ? format(
                      new Date(Number(item.createdAt) || item.createdAt),
                      "dd/MM/yyyy"
                    )
                  : item.date && !isNaN(new Date(item.date).getTime())
                  ? format(new Date(item.date), "dd/MM/yyyy")
                  : "Không rõ ngày"}
              </Text>
            </View>
          </View>
          <View className="flex-row">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < item.rating ? "star" : "star-outline"}
                  size={16}
                  color={i < item.rating ? "#FFD700" : "#cbd5e1"}
                  style={{ marginLeft: 2 }}
                />
              ))}
          </View>
        </View>

        <Text className="text-gray-700 leading-5 mb-2">{item.comment}</Text>

        {item.serviceNames && item.serviceNames.length > 0 && (
          <View className="mt-2 flex-row flex-wrap">
            {item.serviceNames.map((name, index) => (
              <View
                key={index}
                className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-1"
              >
                <Text className="text-xs text-gray-600">{name}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          className="flex-row items-center mt-3 self-start"
          onPress={() => {
            if (item.appointmentId) {
              router.push({
                pathname: "/(stylists)/appointment-details",
                params: { id: item.appointmentId },
              });
            }
          }}
        >
          <Ionicons name="eye-outline" size={14} color={Colors.primary} />
          <Text className="text-xs font-medium text-primary ml-1">
            Xem chi tiết cuộc hẹn
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-gray-500 mt-4">
            Đang tải danh sách đánh giá...
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-16">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={40}
            color="#94a3b8"
          />
        </View>
        <Text className="text-lg font-semibold text-gray-800 mb-1">
          {searchQuery ? "Không tìm thấy đánh giá" : "Chưa có đánh giá"}
        </Text>
        <Text className="text-base text-gray-500 text-center px-8">
          {searchQuery
            ? `Không tìm thấy đánh giá phù hợp với "${searchQuery}"`
            : "Hiện tại bạn chưa có đánh giá nào"}
        </Text>

        {searchQuery && (
          <TouchableOpacity
            className="mt-4 bg-primary/10 py-2 px-4 rounded-full"
            onPress={() => setSearchQuery("")}
          >
            <Text className="text-primary font-medium">Xóa tìm kiếm</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Đánh giá",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: "#1f2937",
          },
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerShadowVisible: false,
        }}
      />
      <StatusBar style="dark" />

      <View className="flex-1 px-4 pt-0">
        {/* Search Bar */}
        <View className="mb-4 mt-[-24px]">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-2 border border-gray-100">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder="Tìm kiếm đánh giá..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter by Rating */}
        <View className="flex-row mb-4">
          {[5, 4, 3, 2, 1].map((rating) => (
            <TouchableOpacity
              key={rating}
              className={`flex-row items-center px-3 py-2 rounded-full mr-2 ${
                filterRating === rating
                  ? "bg-primary"
                  : "bg-white border border-gray-200"
              }`}
              onPress={() =>
                setFilterRating((prev) => (prev === rating ? null : rating))
              }
            >
              <Ionicons
                name="star"
                size={16}
                color={filterRating === rating ? "#ffffff" : Colors.primary}
              />
              <Text
                className={`ml-1 ${
                  filterRating === rating ? "text-white" : "text-primary"
                } font-medium`}
              >
                {rating} sao
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics */}
        {!loading && reviews.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Tổng quan đánh giá
            </Text>

            <View className="flex-row items-center mb-3">
              <Text className="text-3xl font-bold text-gray-900">
                {getAverageRating().toFixed(1)}
              </Text>
              <View className="ml-3 flex-row">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={20}
                      color={
                        i < Math.round(getAverageRating())
                          ? "#FFD700"
                          : "#e2e8f0"
                      }
                      style={{ marginRight: 4 }}
                    />
                  ))}
              </View>
              <Text className="ml-2 text-gray-500">
                ({reviews.length} đánh giá)
              </Text>
            </View>

            {/* Rating bars */}
            {[5, 4, 3, 2, 1].map((star) => (
              <TouchableOpacity
                key={star}
                className="flex-row items-center mb-1.5"
                onPress={() =>
                  handleFilterRating(filterRating === star ? null : star)
                }
                activeOpacity={0.7}
              >
                <Text className="w-3 text-gray-600 mr-2">{star}</Text>
                <Ionicons
                  name="star"
                  size={14}
                  color="#FFD700"
                  style={{ marginRight: 8 }}
                />
                <View className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden mr-2">
                  <View
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${getRatingPercentage(star)}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-600 w-10 text-right">
                  {getRatingCount(star)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Reviews List */}
        <FlatList
          data={filteredReviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            reviews.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </ScreenWrapper>
  );
};

export default ReviewsScreen;
