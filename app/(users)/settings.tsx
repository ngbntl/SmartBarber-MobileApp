import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import { useLogout } from "@/utils/auth";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/hooks/useNotification";
import Toast from "@/components/ui/Toast";
import UpdateUserProfile from "@/components/modal/updateUserProfile";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const logout = useLogout();
  const { toast, setToast } = useNotification();

  const firstName = userInfo?.firstName || "Matthew";
  const lastName = userInfo?.lastName || "McCoy";
  const email = userInfo?.email || "matthew.mccoy@example.com";

  const [notifications, setNotifications] = useState(true);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t("settings.logout_title", "Logout"),
      t("settings.logout_message", "Are you sure you want to logout?"),
      [
        {
          text: t("common.cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("common.logout", "Logout"),
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  const settingItems = [
    {
      icon: "shield-outline",
      label: t("settings.security", "Security"),
      action: () => console.log("Navigate to Security"),
    },
    {
      icon: "language-outline",
      label: t("settings.language", "Language"),
      action: () => console.log("Navigate to Language"),
    },
    {
      icon: "help-circle-outline",
      label: t("settings.help", "Help Center"),
      action: () => console.log("Navigate to Help Center"),
    },
    {
      icon: "information-circle-outline",
      label: t("settings.about", "About"),
      action: () => console.log("Navigate to About"),
    },
  ];

  return (
    <ScreenWrapper bg="transparent">
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        {/* Phần màu xanh trên cùng - giống của stylist */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 350,
            backgroundColor: Colors.primary,
            zIndex: 0,
          }}
        />

        <StatusBar style="light" />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          {/* Header */}
          <View className="flex-row justify-between items-center px-5 pt-14 pb-5">
            <Text className="text-2xl font-semibold text-white">
              {t("settings.title", "Profile")}
            </Text>
          </View>

          {/* Profile Section */}
          <View className="items-center mt-6 pb-20">
            <View className="w-[100px] h-[100px] rounded-full border-2 border-white overflow-hidden mb-2.5">
              <Image
                source={
                  userInfo?.avatar
                    ? { uri: userInfo.avatar }
                    : require("@/assets/images/default-avatar.png")
                }
                className="w-full h-full"
              />
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-white">
                {firstName} {lastName}
              </Text>

              <TouchableOpacity
                className="ml-2 p-1.5 bg-white/20 rounded-full"
                onPress={() => setEditProfileModalVisible(true)}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-2">
              <Ionicons
                name="mail-outline"
                size={18}
                color="#fff"
                className="mr-2"
              />
              <Text className="text-white text-base">{email}</Text>
            </View>
          </View>

          <View className="bg-white -mt-16 rounded-t-[30px] px-5 pt-6 pb-2.5 shadow-lg z-10">
            <Text className="text-lg font-medium mb-4 text-gray-800">
              {t("settings.setting", "Setting")}
            </Text>

            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#555"
                  className="mr-3"
                />
                <Text className="text-base text-gray-800">
                  {t("settings.notifications", "Notification")}
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={(value) => setNotifications(value)}
                trackColor={{ false: "#e0e0e0", true: Colors.primary }}
                ios_backgroundColor="#e0e0e0"
                thumbColor={"#fff"}
              />
            </View>

            {/* Settings Navigation Items */}
            {settingItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row justify-between items-center py-4 ${
                  index === settingItems.length - 1
                    ? ""
                    : "border-b border-gray-100"
                }`}
                onPress={item.action}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color="#555"
                    className="mr-3"
                  />
                  <Text className="text-base text-gray-800">{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="flex-row mx-5 mt-5 mb-2.5 py-4 rounded-xl items-center justify-center"
            style={{ backgroundColor: Colors.primary }}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#fff"
              className="mr-2"
            />
            <Text className="text-white text-base font-semibold">
              {t("common.logout", "Đăng xuất")}
            </Text>
          </TouchableOpacity>

          {/* App version */}
          <Text className="text-center text-xs text-gray-400 mb-8">
            Version 1.0.0
          </Text>
        </ScrollView>
      </View>

      <UpdateUserProfile
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        userInfo={userInfo}
      />
    </ScreenWrapper>
  );
};

export default SettingsScreen;
