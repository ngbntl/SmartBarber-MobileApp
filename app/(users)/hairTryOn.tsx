import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";
import { useNotification } from "@/hooks/useNotification";
import Toast from "@/components/ui/Toast";
import HairStyleApi from "@/api/hairstyles";
import HairColorApi from "@/api/haircolors";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.28;
const ITEM_HEIGHT = width * 0.28;

const HairTryOnScreen = () => {
  const { t } = useTranslation();
  const [userImage, setUserImage] = useState(null);
  const [hairShapeImage, setHairShapeImage] = useState(null);
  const [hairColorImage, setHairColorImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedHairStyle, setSelectedHairStyle] = useState(null);
  const [selectedHairColor, setSelectedHairColor] = useState(null);
  const [fetchedHairStyles, setFetchedHairStyles] = useState([]);
  const [fetchedHairColors, setFetchedHairColors] = useState([]);
  const { appNotification, toast, setToast } = useNotification();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: galleryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== "granted" || galleryStatus !== "granted") {
          Alert.alert(t("common.error"), t("hair_try_on.permission_needed"));
        }
      }

      try {
        const hairStyleApi = new HairStyleApi();
        const stylesResponse = await hairStyleApi.getAllStyles();

        if (stylesResponse && stylesResponse.items) {
          console.log("Fetched hair styles:", stylesResponse.items);
          setFetchedHairStyles(stylesResponse.items);
        } else {
          console.warn("No hair styles found in the response");
        }

        // Lấy màu tóc
        const hairColorApi = new HairColorApi();
        const colorsResponse = await hairColorApi.getAllColors();
        if (colorsResponse && colorsResponse.items) {
          console.log("Fetched hair colors:", colorsResponse.items);
          setFetchedHairColors(colorsResponse.items);
        } else {
          console.warn("No hair colors found in the response");
        }
      } catch (error) {
        console.error("Error fetching hair styles or colors:", error);
      }
    })();
  }, []);

  const pickImage = async (source, setter) => {
    let result;

    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

  const selectHairStyle = (item) => {
    setHairShapeImage(item.imageUrl || item.image);
    setSelectedHairStyle(item.id);
  };

  const selectHairColor = (item) => {
    setHairColorImage(item.imageUrl || item.image);
    setSelectedHairColor(item.id);
  };

  const goToNextStep = () => {
    if (step === 1 && !userImage) {
      Alert.alert(t("common.error"), t("hair_try_on.missingPhoto"));
      return;
    }

    if (step === 2 && !hairShapeImage) {
      Alert.alert(t("common.error"), t("hair_try_on.missingHairStyle"));
      return;
    }

    if (step === 3 && !hairColorImage) {
      Alert.alert(t("common.error"), t("hair_try_on.missingHairColor"));
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    }

    if (step === 3) {
      processImages();
    }
  };

  const processImages = async () => {
    if (!userImage || !hairShapeImage || !hairColorImage) {
      Alert.alert(t("common.error"), t("hair_try_on.missingImages"));
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();

      const getUserFileName = (uri) => {
        const uriParts = uri.split("/");
        return uriParts[uriParts.length - 1];
      };

      const isExternalUrl = (url) =>
        url.startsWith("http") && !url.includes("file:");

      const prepareImageForUpload = async (uri, fieldName, defaultFileName) => {
        try {
          if (isExternalUrl(uri)) {
            console.log(`Fetching external image: ${uri}`);
            const response = await fetch(uri);
            const blob = await response.blob();
            console.log(
              `Successfully fetched external image (${fieldName}): ${blob.size} bytes`
            );

            return {
              uri: uri,
              type: blob.type || "image/jpeg",
              name: defaultFileName,
            };
          } else {
            return {
              uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
              type: "image/jpeg",
              name: getUserFileName(uri) || defaultFileName,
            };
          }
        } catch (error) {
          console.error(`Error preparing ${fieldName}:`, error);
          throw new Error(`Failed to prepare ${fieldName}: ${error.message}`);
        }
      };

      try {
        const faceImage = await prepareImageForUpload(
          userImage,
          "face_file",
          "user-image.jpg"
        );
        const shapeImage = await prepareImageForUpload(
          hairShapeImage,
          "shape_file",
          "hair-shape.jpg"
        );
        const colorImage = await prepareImageForUpload(
          hairColorImage,
          "color_file",
          "hair-color.jpg"
        );

        formData.append("face_file", faceImage as any);
        formData.append("shape_file", shapeImage as any);
        formData.append("color_file", colorImage as any);

        console.log("FormData created successfully with all three images");
      } catch (error) {
        console.error("Failed to prepare images:", error);
        throw error;
      }

      const { expoConfig } = Constants;

      let serverAIUrl = expoConfig?.extra?.SERVER_AI_URL
        ? `${expoConfig.extra.SERVER_AI_URL}`
        : "https://30a4-34-125-113-247.ngrok-free.app";

      if (!serverAIUrl.endsWith("/")) {
        serverAIUrl += "/";
      }
      serverAIUrl += "swap_hair/";

      console.log("Sending request to serverAI URL:", serverAIUrl);

      try {
        const response = await fetch(serverAIUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
          redirect: "follow",
        });

        if (response.ok) {
          const result = await response.json();
          console.log("AI processing completed successfully:", result);
          handleResult(result);
        } else {
          console.error("Server returned error status:", response.status);
          const errorText = await response.text();
          console.error("Server error response:", errorText);

          try {
            const errorJson = JSON.parse(errorText);

            if (
              errorJson.error &&
              errorJson.error.includes("No faces detected")
            ) {
              appNotification({
                message: t("hair_try_on.no_face_detected"),
                statusCode: 400,
              });

              setStep(1);
              setIsProcessing(false);
              return;
            } else {
              throw new Error(
                `Server error: ${errorJson.error || "Unknown error"}`
              );
            }
          } catch (parseError) {
            if (response.status === 500) {
              appNotification({
                message: t("hair_try_on.face_detection_error"),
                statusCode: 500,
              });
              setStep(1);
              setIsProcessing(false);
              return;
            }

            throw new Error(
              `Server error: ${response.status} ${response.statusText}`
            );
          }
        }
      } catch (error) {
        console.error("Error during fetch:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in processImages function:", error);

      if (
        error.message &&
        (error.message.includes("No faces detected") ||
          (typeof error === "object" &&
            error.error &&
            error.error.includes("No faces detected")))
      ) {
        appNotification({
          message: t("hair_try_on.no_face_detected"),
          statusCode: 500,
        });
        setStep(1);
      } else {
        appNotification({
          message: `${t("hair_try_on.processing_error")}: ${error.message}`,
          statusCode: 400,
        });
      }

      setIsProcessing(false);
    }
  };

  const handleResult = (result) => {
    if (result && result.result_image_url) {
      setResultImage(result.result_image_url);
    } else {
      setResultImage(hairShapeImage);
      console.warn("API didn't return an image URL, using fallback image");
    }
    setStep(4);
    setIsProcessing(false);
  };

  const resetImages = () => {
    setUserImage(null);
    setHairShapeImage(null);
    setHairColorImage(null);
    setResultImage(null);
    setSelectedHairStyle(null);
    setSelectedHairColor(null);
    setStep(1);
  };

  const renderHairStyleItem = ({ item }) => (
    <TouchableOpacity
      className={`mr-3 items-center`}
      onPress={() => selectHairStyle(item)}
      activeOpacity={0.7}
    >
      <View
        className={`overflow-hidden rounded-lg ${
          selectedHairStyle === item.id
            ? "border-2 border-primary"
            : "border border-gray-300"
        }`}
        style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
      >
        <Image
          source={{ uri: item.imageUrl || item.image }}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />
      </View>
      <Text
        className={`text-xs font-medium text-center mt-1 ${
          selectedHairStyle === item.id ? "text-primary" : "text-gray-700"
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderHairColorItem = ({ item }) => (
    <TouchableOpacity
      className={`mr-3 items-center`}
      onPress={() => selectHairColor(item)}
      activeOpacity={0.7}
    >
      <View
        className={`overflow-hidden rounded-lg ${
          selectedHairColor === item.id
            ? "border-2 border-primary"
            : "border border-gray-300"
        }`}
        style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
      >
        <Image
          source={{ uri: item.imageUrl || item.image }}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />
      </View>
      <Text
        className={`text-xs font-medium text-center mt-1 ${
          selectedHairColor === item.id ? "text-primary" : "text-gray-700"
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderImagePicker = (title, image, setter, icon, step) => (
    <View className="w-full mb-2">
      <Text className="text-base font-semibold mb-2">{title}</Text>
      {image ? (
        <View className="relative rounded-xl overflow-hidden w-full aspect-square">
          <Image source={{ uri: image }} className="w-full h-full" />
          <TouchableOpacity
            className="absolute bottom-2.5 right-2.5 bg-primary rounded-full w-10 h-10 items-center justify-center"
            onPress={() =>
              Alert.alert(
                t("hair_try_on.changeImage"),
                t("hair_try_on.upload_image_prompt"),
                [
                  {
                    text: t("hair_try_on.camera"),
                    onPress: () => pickImage("camera", setter),
                  },
                  {
                    text: t("hair_try_on.gallery"),
                    onPress: () => pickImage("gallery", setter),
                  },
                  { text: t("common.cancel"), style: "cancel" },
                ]
              )
            }
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className={`border-2 border-primary border-dashed rounded-xl items-center justify-center aspect-square w-full ${
            step === 1 ||
            (step === 2 && setter === setHairShapeImage) ||
            (step === 3 && setter === setHairColorImage)
              ? "opacity-100"
              : "opacity-50"
          }`}
          onPress={() =>
            Alert.alert(
              t("hair_try_on.uploadImage"),
              t("hair_try_on.upload_image_prompt"),
              [
                {
                  text: t("hair_try_on.camera"),
                  onPress: () => pickImage("camera", setter),
                },
                {
                  text: t("hair_try_on.gallery"),
                  onPress: () => pickImage("gallery", setter),
                },
                { text: t("common.cancel"), style: "cancel" },
              ]
            )
          }
          disabled={
            !(
              step === 1 ||
              (step === 2 && setter === setHairShapeImage) ||
              (step === 3 && setter === setHairColorImage)
            )
          }
        >
          <Ionicons name={icon} size={40} color={Colors.primary} />
          <Text className="mt-2 text-base text-primary">
            {t("hair_try_on.upload")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="flex-row items-center justify-between px-4 py-1.5 border-b border-[#f0f0f0]">
          <TouchableOpacity className="p-1.5" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text className="text-base font-bold">{t("hair_try_on.title")}</Text>
          <View className="w-8" />
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        <View className="flex-row justify-center mb-4">
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              className={`w-2 h-2 rounded-full mx-1.5 ${
                step >= s ? "bg-primary" : "bg-[#E0E0E0]"
              }`}
            />
          ))}
        </View>

        <Text className="text-lg font-semibold text-center mb-3 text-[#333]">
          {step === 1 && t("hair_try_on.step1")}
          {step === 2 && t("hair_try_on.step2")}
          {step === 3 && t("hair_try_on.step3")}
          {step === 4 && t("hair_try_on.step4")}
        </Text>

        {step < 4 && (
          <View className="flex-col justify-between mb-5">
            {step === 1 &&
              renderImagePicker(
                t("hair_try_on.yourPhoto"),
                userImage,
                setUserImage,
                "person",
                step
              )}

            {step === 2 && (
              <View>
                {renderImagePicker(
                  t("hair_try_on.hairShape"),
                  hairShapeImage,
                  setHairShapeImage,
                  "cut",
                  step
                )}

                <View className="mb-4">
                  <Text className="text-sm text-gray-500 mb-2">
                    {t("hair_try_on.selectSuggestions")}
                  </Text>
                  <FlatList
                    data={
                      fetchedHairStyles.length > 0
                        ? fetchedHairStyles
                        : hairStyleSamples
                    }
                    renderItem={renderHairStyleItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                  />
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                {renderImagePicker(
                  t("hair_try_on.hairColor"),
                  hairColorImage,
                  setHairColorImage,
                  "color-palette",
                  step
                )}

                <View className="mb-4">
                  <Text className="text-sm text-gray-500 mb-2">
                    {t("hair_try_on.colorSuggestions")}
                  </Text>
                  <FlatList
                    data={
                      fetchedHairColors.length > 0
                        ? fetchedHairColors
                        : hairColorSamples
                    }
                    renderItem={renderHairColorItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {step === 4 && resultImage && (
          <View className="items-center py-5">
            <View className="flex-col items-center justify-center mb-8">
              <View className="items-center mb-6">
                <Text className="text-lg font-semibold mb-3">
                  {t("hair_try_on.beforeLabel")}
                </Text>
                <Image
                  source={{ uri: userImage }}
                  className="w-[250px] h-[250px] rounded-lg"
                  style={{ resizeMode: "contain" }}
                />
              </View>

              <Ionicons name="arrow-down" size={30} color={Colors.primary} />

              <View className="items-center mt-6">
                <Text className="text-lg font-semibold mb-3">
                  {t("hair_try_on.afterLabel")}
                </Text>
                <Image
                  source={{ uri: resultImage }}
                  className="w-[250px] h-[250px] rounded-lg"
                  style={{ resizeMode: "contain" }}
                />
              </View>
            </View>

            <View className="flex-row bg-[#F0F8FF] p-4 rounded-xl my-5 items-start">
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.primary}
              />
              <Text className="flex-1 ml-3 text-[#333]">
                {t("hair_try_on.previewInfo")}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-primary py-4 px-7 rounded-3xl mt-5"
              onPress={() => router.push("/appointments")}
            >
              <Text className="text-white font-bold text-base">
                {t("hair_try_on.bookAppointment")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && (
          <View className="absolute inset-0 bg-white/90 items-center justify-center z-[1000]">
            <View className="bg-white p-8 rounded-xl items-center justify-center shadow-md">
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text className="mt-4 text-base font-medium">
                {t("hair_try_on.processingHairstyle")}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <SafeAreaView
        edges={["bottom"]}
        className="bg-white border-t border-[#f0f0f0] px-4 py-2"
      >
        {step < 4 ? (
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="py-3 px-4 border border-primary rounded-lg flex-1 mr-2.5 items-center"
              onPress={resetImages}
            >
              <Text className="text-primary font-semibold">
                {t("hair_try_on.reset")}
              </Text>
            </TouchableOpacity>

            {step === 3 && userImage && hairShapeImage && hairColorImage ? (
              <TouchableOpacity
                className="bg-primary py-3 px-4 rounded-lg flex-1 ml-2.5 items-center justify-center"
                onPress={processImages}
                disabled={isProcessing}
              >
                <Text className="text-white font-semibold">
                  {t("hair_try_on.tryOnNow")}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className={`bg-primary py-3 px-4 rounded-lg flex-1 ml-2.5 items-center justify-center ${
                  (step === 1 && !userImage) ||
                  (step === 2 && !hairShapeImage) ||
                  (step === 3 && !hairColorImage)
                    ? "opacity-50"
                    : ""
                }`}
                onPress={goToNextStep}
                disabled={
                  (step === 1 && !userImage) ||
                  (step === 2 && !hairShapeImage) ||
                  (step === 3 && !hairColorImage)
                }
              >
                <Text className="text-white font-semibold">
                  {t("hair_try_on.continue")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            className="border border-primary py-3 px-7 rounded-3xl self-center"
            onPress={resetImages}
          >
            <Text className="text-primary font-semibold">
              {t("hair_try_on.tryAnotherHairstyle")}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

export default HairTryOnScreen;
