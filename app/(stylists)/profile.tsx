import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { Colors } from "@/constants/Colors";
import { useLogout } from "@/utils/auth";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/hooks/useNotification";
import * as ImagePicker from "expo-image-picker";
import { RootState } from "@/store";
import { setUserInfo } from "@/store/authSlice";
import StylistApi, { StylistUpdateData } from "@/api/stylist";
import UserApi from "@/api/userApi";
import Toast from "@/components/ui/Toast";
import Input from "@/components/input/Input";

const Profile = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast, setToast, appNotification } = useNotification();
  const logout = useLogout();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [notifications, setNotifications] = useState(true);

  // Thông tin profile
  const firstName = userInfo?.firstName || "";
  const lastName = userInfo?.lastName || "";
  const fullName =
    userInfo?.fullName || `${firstName} ${lastName}`.trim() || "Chưa cập nhật";
  const email = userInfo?.email || "Chưa cập nhật";
  const phone = userInfo?.phoneNumber || userInfo?.phone || "Chưa cập nhật";
  const experienceYears = userInfo?.experienceYears || "0";
  const specialization = userInfo?.specialization || "Chưa cập nhật";

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editFirstName, setEditFirstName] = useState(firstName);
  const [editLastName, setEditLastName] = useState(lastName);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);
  const [editSpecialization, setEditSpecialization] = useState(specialization);
  const [editExperienceYears, setEditExperienceYears] = useState(
    experienceYears.toString()
  );
  const [editAvatar, setEditAvatar] = useState(userInfo?.avatar || null);

  // Validation errors
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleLogout = () => {
    Alert.alert(
      t("settings.logout_title", "Đăng xuất"),
      t("settings.logout_message", "Bạn có chắc chắn muốn đăng xuất?"),
      [
        {
          text: t("common.cancel", "Hủy"),
          style: "cancel",
        },
        {
          text: t("common.logout", "Đăng xuất"),
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  const settingItems = [
    {
      icon: "shield-outline",
      label: t("Bảo mật"),
      action: () => console.log("Navigate to Security"),
    },

    {
      icon: "help-circle-outline",
      label: t("Trợ giúp"),
      action: () => console.log("Navigate to Help Center"),
    },
    {
      icon: "information-circle-outline",
      label: t("Thông tin ứng dụng"),
      action: () => console.log("Navigate to About"),
    },
  ];

  const openEditProfileModal = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setEditEmail(email);
    setEditPhone(phone);
    setEditSpecialization(specialization);
    setEditExperienceYears(experienceYears.toString());
    setEditAvatar(userInfo?.avatar || null);

    // Reset error states
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPhoneError("");

    setIsEditing(true);
  };

  const closeEditProfileModal = () => {
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập", "Bạn cần cấp quyền để chọn ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setEditAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setToast({
        message: "Không thể chọn ảnh. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;

    if (!editFirstName.trim()) {
      setFirstNameError("Tên không được để trống");
      isValid = false;
    } else {
      setFirstNameError("");
    }

    if (!editLastName.trim()) {
      setLastNameError("Họ không được để trống");
      isValid = false;
    } else {
      setLastNameError("");
    }

    if (!editEmail.trim()) {
      setEmailError("Email không được để trống");
      isValid = false;
    } else if (!validateEmail(editEmail)) {
      setEmailError("Email không hợp lệ");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (editPhone && editPhone.trim() && !/^\d{10,}$/.test(editPhone)) {
      setPhoneError("Số điện thoại không hợp lệ");
      isValid = false;
    } else {
      setPhoneError("");
    }

    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const stylistApi = new StylistApi();
      let updatedUser = { ...userInfo };
      let hasChanges = false;

      // Check if profile data has changed
      const profileChanged =
        editFirstName !== firstName ||
        editLastName !== lastName ||
        editEmail !== email ||
        editPhone !== phone ||
        editSpecialization !== specialization ||
        editExperienceYears !== experienceYears.toString();

      if (profileChanged && userInfo?.id) {
        const updatedUserData: StylistUpdateData = {
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phoneNumber: editPhone,
          specialization: editSpecialization,
          experienceYears: parseInt(editExperienceYears),
        };

        const result = await stylistApi.updateStylist(
          userInfo.id,
          updatedUserData
        );
        if (result) {
          const fullName = `${editFirstName} ${editLastName}`.trim();

          updatedUser = {
            ...updatedUser,
            ...updatedUserData,
            fullName,
          };
          hasChanges = true;
        }
      }

      // Handle avatar update
      const avatarChanged =
        editAvatar &&
        editAvatar !== userInfo?.avatar &&
        !editAvatar.startsWith("http");

      if (avatarChanged) {
        try {
          const formData = new FormData();
          const fileName = editAvatar.split("/").pop();
          const match = /\.(\w+)$/.exec(fileName || "image.jpg");
          const type = match ? `image/${match[1]}` : "image/jpeg";

          formData.append("file", {
            uri: editAvatar,
            type: type,
            name: fileName || `photo_${Date.now()}.jpg`,
          } as any);

          const userApi = new UserApi();
          const avatarResult = await userApi.updateAvatar(formData);

          if (avatarResult) {
            const newAvatarUrl =
              avatarResult.avatar || avatarResult.avatarUrl || avatarResult.url;

            if (newAvatarUrl) {
              updatedUser.avatar = newAvatarUrl;
              hasChanges = true;
            }
          }
        } catch (avatarError) {
          console.error("Error uploading avatar:", avatarError);
          setToast({
            message: "Không thể cập nhật ảnh đại diện",
            type: "error",
          });
        }
      }

      if (hasChanges) {
        dispatch(setUserInfo(updatedUser));
        setToast({
          message: "Cập nhật thông tin thành công",
          type: "success",
        });
      }

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setToast({
        message: "Không thể cập nhật thông tin. Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="light" />

      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        {/* Phần màu xanh trên cùng */}
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

        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 pt-14 pb-5">
            <Text className="text-2xl font-semibold text-white">
              {t("settings.title", "Hồ sơ")}
            </Text>

            <TouchableOpacity onPress={() => router.back()}>
              <View className="bg-white/20 rounded-full p-2">
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
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
              <Text className="text-2xl font-bold text-white">{fullName}</Text>

              <TouchableOpacity
                className="ml-2 p-1.5 bg-white/20 rounded-full"
                onPress={openEditProfileModal}
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

            <View className="flex-row items-center mt-2">
              <Ionicons
                name="star-outline"
                size={18}
                color="#fff"
                className="mr-2"
              />
              <Text className="text-white text-base">
                {experienceYears} năm kinh nghiệm
              </Text>
            </View>
          </View>

          {/* Settings section */}
          <View className="bg-white -mt-16 rounded-t-[30px] px-5 pt-6 pb-2.5 shadow-lg z-10">
            <Text className="text-lg font-medium mb-4 text-gray-800">
              {t("settings.setting", "Cài đặt")}
            </Text>

            <View className="flex-row items-center mb-4 py-4 border-b border-gray-100">
              <Ionicons
                name="call-outline"
                size={22}
                color="#555"
                className="mr-3"
              />
              <View>
                <Text className="text-base text-gray-800">Số điện thoại</Text>
                <Text className="text-sm text-gray-500 mt-1">{phone}</Text>
              </View>
            </View>

            {specialization && specialization !== "Chưa cập nhật" && (
              <View className="flex-row items-center mb-4 py-4 border-b border-gray-100">
                <Ionicons
                  name="cut-outline"
                  size={22}
                  color="#555"
                  className="mr-3"
                />
                <View>
                  <Text className="text-base text-gray-800">Chuyên môn</Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {specialization}
                  </Text>
                </View>
              </View>
            )}

            {/* <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#555"
                  className="mr-3"
                />
                <Text className="text-base text-gray-800">
                  {t("settings.notifications", "Thông báo")}
                </Text>
              </View>
              <View className="ml-auto">
                <TouchableOpacity
                  className={`px-3 py-1.5 rounded-full ${
                    notifications ? "bg-primary" : "bg-gray-300"
                  }`}
                  onPress={() => setNotifications(!notifications)}
                >
                  <Text className="text-white text-sm">
                    {notifications ? "Bật" : "Tắt"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View> */}

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
              {t("settings.logout", "Đăng xuất")}
            </Text>
          </TouchableOpacity>

          {/* App version */}
          <Text className="text-center text-xs text-gray-400 mb-8">
            Version 1.0.0
          </Text>
        </ScrollView>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={false}
        onRequestClose={closeEditProfileModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 pt-12 pb-3 border-b border-gray-100">
              <TouchableOpacity className="p-2" onPress={closeEditProfileModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">
                Chỉnh sửa hồ sơ
              </Text>
              <View className="w-10" />
            </View>

            <ScrollView
              className="flex-1 bg-white px-5 pt-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Picture */}
              <View className="items-center mb-6">
                <View className="relative">
                  <View className="w-[120px] h-[120px] rounded-full border-2 border-gray-200 overflow-hidden">
                    <Image
                      source={
                        editAvatar
                          ? { uri: editAvatar }
                          : require("@/assets/images/default-avatar.png")
                      }
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <TouchableOpacity
                    className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center border-2 border-white"
                    onPress={pickImage}
                  >
                    <Ionicons name="camera" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">Tên</Text>
                <Input
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  error={firstNameError}
                  placeholder="Nhập tên"
                  containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
                />
                {firstNameError ? (
                  <Text className="text-red-500 text-xs mt-1">
                    {firstNameError}
                  </Text>
                ) : null}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">Họ</Text>
                <Input
                  value={editLastName}
                  onChangeText={setEditLastName}
                  error={lastNameError}
                  placeholder="Nhập họ"
                  containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
                />
                {lastNameError ? (
                  <Text className="text-red-500 text-xs mt-1">
                    {lastNameError}
                  </Text>
                ) : null}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">Email</Text>
                <Input
                  value={editEmail}
                  onChangeText={setEditEmail}
                  error={emailError}
                  placeholder="Nhập email"
                  containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? (
                  <Text className="text-red-500 text-xs mt-1">
                    {emailError}
                  </Text>
                ) : null}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">
                  Số điện thoại
                </Text>
                <Input
                  value={editPhone}
                  onChangeText={setEditPhone}
                  error={phoneError}
                  placeholder="Nhập số điện thoại"
                  containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
                  keyboardType="phone-pad"
                />
                {phoneError ? (
                  <Text className="text-red-500 text-xs mt-1">
                    {phoneError}
                  </Text>
                ) : null}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">
                  Chuyên môn
                </Text>
                <Input
                  value={editSpecialization}
                  onChangeText={setEditSpecialization}
                  placeholder="Nhập chuyên môn (ví dụ: cắt tóc nam, uốn, nhuộm...)"
                  containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">
                  Số năm kinh nghiệm
                </Text>
                <Input
                  value={editExperienceYears}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const filtered = text.replace(/[^0-9]/g, "");
                    setEditExperienceYears(filtered);
                  }}
                  placeholder="Nhập số năm kinh nghiệm"
                  containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
                  keyboardType="numeric"
                />
              </View>

              {/* Save Button */}
              <View className="mt-8 mb-10">
                <TouchableOpacity
                  className={`bg-primary rounded-lg py-3.5 items-center ${
                    isLoading ? "opacity-70" : ""
                  }`}
                  onPress={handleUpdateProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Lưu thay đổi
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default Profile;
