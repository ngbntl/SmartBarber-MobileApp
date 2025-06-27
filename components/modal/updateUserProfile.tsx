import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/Colors";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/store/authSlice";
import Input from "@/components/input/Input";
import Button from "@/components/button/Button";
import UserApi from "@/api/userApi";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/hooks/useNotification";

interface UpdateUserProfileProps {
  visible: boolean;
  onClose: () => void;
  userInfo: any;
}

const UpdateUserProfile = ({
  visible,
  onClose,
  userInfo,
}: UpdateUserProfileProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { appNotification, setToast } = useNotification();

  const [editFirstName, setEditFirstName] = useState(userInfo?.firstName || "");
  const [editLastName, setEditLastName] = useState(userInfo?.lastName || "");
  const [editAvatar, setEditAvatar] = useState(userInfo?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  useEffect(() => {
    if (visible) {
      setEditFirstName(userInfo?.firstName || "");
      setEditLastName(userInfo?.lastName || "");
      setEditAvatar(userInfo?.avatar || null);

      setFirstNameError("");
      setLastNameError("");
    }
  }, [visible, userInfo]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          t("common.permission_required"),
          t("settings.camera_roll_permission")
        );
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
      appNotification({
        message: t("common.error_picking_image"),
        statusCode: 400,
      });
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!editFirstName.trim()) {
      setFirstNameError(t("auth.register.firstName_required"));
      isValid = false;
    } else {
      setFirstNameError("");
    }

    if (!editLastName.trim()) {
      setLastNameError(t("auth.register.lastName_required"));
      isValid = false;
    } else {
      setLastNameError("");
    }

    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const userApi = new UserApi();
      let updatedUser = { ...userInfo };
      let hasChanges = false;

      // Update profile information (firstName, lastName)
      const profileChanged =
        editFirstName !== userInfo?.firstName ||
        editLastName !== userInfo?.lastName;

      if (profileChanged) {
        try {
          const updatedUserData = {
            firstName: editFirstName,
            lastName: editLastName,
          };

          const result = await userApi.updateProfile(updatedUserData);
          if (result) {
            const fullName = `${editFirstName} ${editLastName}`.trim();

            updatedUser = {
              ...updatedUser,
              ...updatedUserData,
              fullName,
            };
            hasChanges = true;
            setToast({
              message: t("settings.profile_updated_successfully"),
              type: "success",
            });
          }
        } catch (profileError: any) {
          console.error("Error updating profile data:", profileError);
          appNotification({
            message: profileError?.message || t("settings.profile_update_error"),
            statusCode: profileError?.statusCode || 400,
          });
          // Continue with avatar upload even if profile update fails
        }
      }

      // Update avatar if changed
      const avatarChanged =
        editAvatar &&
        editAvatar !== userInfo?.avatar &&
        !editAvatar.startsWith("http");

      if (avatarChanged) {
        try {
          const formData = new FormData();
          const fileName = editAvatar.split("/").pop() || `photo_${Date.now()}.jpg`;
          const match = /\.(\w+)$/.exec(fileName);
          const type = match ? `image/${match[1]}` : "image/jpeg";

          // Create the file object properly
          formData.append("file", {
            uri: editAvatar,
            type: type,
            name: fileName,
          } as any);

          const avatarResult = await userApi.updateAvatar(formData);
          
          if (avatarResult) {
            // Check different possible response formats
            const newAvatarUrl =
              avatarResult.avatar || 
              avatarResult.avatarUrl || 
              avatarResult.url || 
              (typeof avatarResult === 'string' ? avatarResult : null);

            if (newAvatarUrl) {
              updatedUser.avatar = newAvatarUrl;
              hasChanges = true;
              setToast({
                message: t("settings.avatar_updated_successfully"),
                type: "success",
              });
            } else {
              console.warn("Avatar upload response format is unexpected:", avatarResult);
              appNotification({
                message: t("settings.avatar_update_error"),
                statusCode: 400,
              });
            }
          }
        } catch (avatarError: any) {
          console.error("Error uploading avatar:", avatarError);
          appNotification({
            message: avatarError?.message || t("settings.avatar_update_error"),
            statusCode: avatarError?.statusCode || 400,
          });
        }
      }

      if (hasChanges) {
        dispatch(setUserInfo(updatedUser));
        onClose();
      } else {
        // If no changes were made successfully, just close the modal
        onClose();
      }
    } catch (error: any) {
      console.error("Error in profile update process:", error);
      appNotification({
        message: error?.message || t("common.something_went_wrong"),
        statusCode: error?.statusCode || 400,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100">
          <TouchableOpacity className="p-2" onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            {t("settings.edit_profile", "Edit Profile")}
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
            <Text className="text-gray-700 mb-1 font-medium">
              {t("settings.first_name", "First Name")}
            </Text>
            <Input
              value={editFirstName}
              onChangeText={setEditFirstName}
              error={firstNameError}
              placeholder={t("settings.enter_first_name", "Enter first name")}
              containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
            />
            {firstNameError ? (
              <Text className="text-red-500 text-xs mt-1">
                {firstNameError}
              </Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-1 font-medium">
              {t("settings.last_name", "Last Name")}
            </Text>
            <Input
              value={editLastName}
              onChangeText={setEditLastName}
              error={lastNameError}
              placeholder={t("settings.enter_last_name", "Enter last name")}
              containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
            />
            {lastNameError ? (
              <Text className="text-red-500 text-xs mt-1">{lastNameError}</Text>
            ) : null}
          </View>

          {/* <View className="mb-4">
            <Text className="text-gray-700 mb-1 font-medium">
              {t("settings.email", "Email")}
            </Text>
            <Input
              value={userInfo?.email || ""}
              containerStyle="bg-gray-50 rounded-md py-2 px-4 border border-gray-200"
              editable={false} // Email is usually not editable for security reasons
            />
          </View> */}

          {/* Save Button */}
          <View className="mt-8 mb-10">
            <Button
              title={t("settings.save_changes", "Save Changes")}
              loading={isLoading}
              onPress={handleUpdateProfile}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default UpdateUserProfile;
