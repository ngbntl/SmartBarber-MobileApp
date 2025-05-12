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
import BranchesApi from "@/api/branches";

interface BranchesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBranch: (branch: any) => void;
  selectedBranch: any | null;
}

const BranchesModal = ({
  visible,
  onClose,
  onSelectBranch,
  selectedBranch,
}: BranchesModalProps) => {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const branchesApi = new BranchesApi();

  useEffect(() => {
    if (visible) {
      fetchBranches();
    } else {
      setSearchQuery("");
    }
  }, [visible]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const branchData = await branchesApi.getBranches();
      setBranches(branchData.items || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter branches based on search query
  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.address &&
        branch.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            {t("appointments.select_branch")}
          </Text>
        </View>

        <View className="px-4 py-3">
          <View className="flex-row bg-white rounded-lg px-4 py-2.5 items-center border border-[#eee]">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder={t("appointments.search_branch")}
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

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            className="flex-1 justify-center items-center"
          />
        ) : (
          <FlatList
            data={filteredBranches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow"
                onPress={() => onSelectBranch(item)}
              >
                <Image
                  source={item.image || require("@/assets/images/logo.png")}
                  className="w-[60px] h-[60px] rounded-lg"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-base font-bold mb-1">{item.name}</Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text className="text-sm text-[#666] ml-1">
                      {item.address + ", " + item.district + ", " + item.city ||
                        "No address"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text className="text-sm text-primary ml-1 font-medium">
                      {item.rating > 0 ? item.rating : t("home.new")}
                    </Text>
                  </View>
                </View>
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

export default BranchesModal;
