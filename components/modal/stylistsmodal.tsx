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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";

interface StylistsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectStylist: (stylist: any) => void;
  selectedStylist: any | null;
  selectedService: any | null;
}

const StylistsModal = ({
  visible,
  onClose,
  onSelectStylist,
  selectedStylist,
  selectedService,
}: StylistsModalProps) => {
  const { t } = useTranslation();
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch stylists when modal is opened
  useEffect(() => {
    if (visible && selectedService) {
      fetchStylists();
    } else {
      setSearchQuery("");
    }
  }, [visible, selectedService]);

  const fetchStylists = async () => {
    setLoading(true);
    try {
      // Replace with actual API call when available
      setTimeout(() => {
        setStylists([
          {
            id: "1",
            name: "John Doe",
            experience: "5 years",
            avatar: require("@/assets/images/logo.png"),
            rating: 4.8,
          },
          {
            id: "2",
            name: "Jane Smith",
            experience: "7 years",
            avatar: require("@/assets/images/logo.png"),
            rating: 4.9,
          },
          {
            id: "3",
            name: "Mike Johnson",
            experience: "3 years",
            avatar: require("@/assets/images/logo.png"),
            rating: 4.7,
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching stylists:", error);
      setLoading(false);
    }
  };

  // Filter stylists based on search query
  const filteredStylists = stylists.filter((stylist) =>
    stylist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-[#F5F5F5]">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-3 pb-4 bg-white">
          <TouchableOpacity className="mr-4 p-1" onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold">
            {t("appointments.select_stylist")}
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3">
          <View className="flex-row bg-white rounded-lg px-4 py-2.5 items-center border border-[#eee]">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder={t("appointments.search_stylist")}
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

        {/* Stylists List or Loading */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            className="flex-1 justify-center items-center"
          />
        ) : (
          <FlatList
            data={filteredStylists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow"
                onPress={() => onSelectStylist(item)}
              >
                <Image
                  source={item.avatar || require("@/assets/images/logo.png")}
                  className="w-[60px] h-[60px] rounded-full"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-base font-bold mb-1">{item.name}</Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="briefcase-outline" size={14} color="#666" />
                    <Text className="text-sm text-[#666] ml-1">
                      {t("appointments.experience")}:{" "}
                      {item.experience || "3 years"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text className="text-sm text-[#333] ml-1 font-medium">
                      {item.rating || 4.5}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className={`py-1.5 px-3 rounded-full ml-3 ${
                    selectedStylist?.id === item.id
                      ? "bg-[#28a745]"
                      : "bg-primary"
                  }`}
                  onPress={() => onSelectStylist(item)}
                >
                  <Text className="text-sm text-white font-medium">
                    {t("appointments.select")}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
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
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default StylistsModal;
