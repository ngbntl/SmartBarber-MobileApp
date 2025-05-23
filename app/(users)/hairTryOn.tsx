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
  StatusBar as RNStatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const hairStyleSamples = [
  { id: 1, name: "Bob Cut", image: "https://i.imgur.com/JQbiLVA.png" },
  { id: 2, name: "Pixie Cut", image: "https://i.imgur.com/ymTyqQj.png" },
  { id: 3, name: "Long Layers", image: "https://i.imgur.com/R5LvPCd.png" },
  { id: 4, name: "Curly", image: "https://i.imgur.com/0sxs23M.png" },
  { id: 5, name: "Wavy", image: "https://i.imgur.com/RlDKHmy.png" },
  { id: 6, name: "Short", image: "https://i.imgur.com/AbAKZYO.png" },
];

const hairColorSamples = [
  {
    id: 1,
    name: "Blonde",
    color: "#E6BE8A",
    image: "https://i.imgur.com/gXGKjU9.png",
  },
  {
    id: 2,
    name: "Brown",
    color: "#8C4C36",
    image: "https://i.imgur.com/NfLv5Cc.png",
  },
  {
    id: 3,
    name: "Black",
    color: "#252525",
    image: "https://i.imgur.com/trcEDPG.png",
  },
  {
    id: 4,
    name: "Red",
    color: "#BC4E29",
    image: "https://i.imgur.com/ShTEslX.png",
  },
  {
    id: 5,
    name: "Silver",
    color: "#C0C0C0",
    image: "https://i.imgur.com/c7aBgW7.png",
  },
  {
    id: 6,
    name: "Pink",
    color: "#FF9AFF",
    image: "https://i.imgur.com/xK8MiJ9.png",
  },
  {
    id: 7,
    name: "Blue",
    color: "#4F86F7",
    image: "https://i.imgur.com/47AVKk9.png",
  },
];

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

  // Request permission for camera and gallery access
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: galleryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== "granted" || galleryStatus !== "granted") {
          Alert.alert(
            "Permission needed",
            "Camera and gallery permissions are required for this feature."
          );
        }
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
    setHairShapeImage(item.image);
    setSelectedHairStyle(item.id);
  };

  const selectHairColor = (item) => {
    setHairColorImage(item.image);
    setSelectedHairColor(item.id);
  };

  const goToNextStep = () => {
    if (step === 1 && !userImage) {
      Alert.alert("Missing Photo", "Please upload or take your photo first.");
      return;
    }

    if (step === 2 && !hairShapeImage) {
      Alert.alert(
        "Missing Hair Style",
        "Please select or upload a hair style."
      );
      return;
    }

    if (step === 3 && !hairColorImage) {
      Alert.alert(
        "Missing Hair Color",
        "Please select or upload a hair color."
      );
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
      Alert.alert(
        "Missing images",
        "Please upload all three required images first."
      );
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setResultImage(hairShapeImage);
      setStep(4);
    } catch (error) {
      Alert.alert(
        "Processing error",
        "An error occurred while processing your images."
      );
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
    }
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
          source={{ uri: item.image }}
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
          source={{ uri: item.image }}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />
      </View>
      <View className="flex-row items-center justify-center mt-1">
        <View
          className="h-3 w-3 rounded-full mr-1"
          style={{ backgroundColor: item.color }}
        />
        <Text
          className={`text-xs font-medium ${
            selectedHairColor === item.id ? "text-primary" : "text-gray-700"
          }`}
        >
          {item.name}
        </Text>
      </View>
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
                "Change Image",
                "How would you like to upload your image?",
                [
                  {
                    text: "Camera",
                    onPress: () => pickImage("camera", setter),
                  },
                  {
                    text: "Gallery",
                    onPress: () => pickImage("gallery", setter),
                  },
                  { text: "Cancel", style: "cancel" },
                ]
              )
            }
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className={`border-2 border-primary border-dashed rounded-xl items-center justify-center p-10 h-[180px] ${
            step === 1 ||
            (step === 2 && setter === setHairShapeImage) ||
            (step === 3 && setter === setHairColorImage)
              ? "opacity-100"
              : "opacity-50"
          }`}
          onPress={() =>
            Alert.alert(
              "Upload Image",
              "How would you like to upload your image?",
              [
                { text: "Camera", onPress: () => pickImage("camera", setter) },
                {
                  text: "Gallery",
                  onPress: () => pickImage("gallery", setter),
                },
                { text: "Cancel", style: "cancel" },
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
          <Text className="mt-2 text-base text-primary">Upload</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="flex-row items-center justify-between px-4 py-1.5 border-b border-[#f0f0f0]">
          <TouchableOpacity className="p-1.5" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text className="text-base font-bold">Hair Try-On</Text>
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
          {step === 1 && "Step 1: Upload your photo"}
          {step === 2 && "Step 2: Choose hair shape"}
          {step === 3 && "Step 3: Pick hair color"}
          {step === 4 && "All done! Here's your new look"}
        </Text>

        {step < 4 && (
          <View className="flex-col justify-between mb-5">
            {step === 1 &&
              renderImagePicker(
                "Your Photo",
                userImage,
                setUserImage,
                "person",
                step
              )}

            {step === 2 && (
              <View>
                {renderImagePicker(
                  "Hair Shape",
                  hairShapeImage,
                  setHairShapeImage,
                  "cut",
                  step
                )}

                <View className="mb-4">
                  <Text className="text-sm text-gray-500 mb-2">
                    Or select from our style suggestions:
                  </Text>
                  <FlatList
                    data={hairStyleSamples}
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
                  "Hair Color",
                  hairColorImage,
                  setHairColorImage,
                  "color-palette",
                  step
                )}

                <View className="mb-4">
                  <Text className="text-sm text-gray-500 mb-2">
                    Or select from our color suggestions:
                  </Text>
                  <FlatList
                    data={hairColorSamples}
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
            <View className="flex-row items-center justify-center mb-8">
              <View className="items-center">
                <Text className="text-base font-semibold mb-2">Before</Text>
                <Image
                  source={{ uri: userImage }}
                  className="w-[140px] h-[140px] rounded-lg mx-2.5"
                />
              </View>
              <Ionicons name="arrow-forward" size={30} color={Colors.primary} />
              <View className="items-center">
                <Text className="text-base font-semibold mb-2">After</Text>
                <Image
                  source={{ uri: resultImage }}
                  className="w-[140px] h-[140px] rounded-lg mx-2.5"
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
                This is a preview of how you might look with your selected
                hairstyle. For best results, visit our salon!
              </Text>
            </View>

            <TouchableOpacity
              className="bg-primary py-4 px-7 rounded-3xl mt-5"
              onPress={() => router.push("/appointments")}
            >
              <Text className="text-white font-bold text-base">
                Book an Appointment
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && (
          <View className="absolute inset-0 bg-white/90 items-center justify-center z-[1000]">
            <View className="bg-white p-8 rounded-xl items-center justify-center shadow-md">
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text className="mt-4 text-base font-medium">
                Processing your hairstyle...
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
              <Text className="text-primary font-semibold">Reset</Text>
            </TouchableOpacity>

            {step === 3 && userImage && hairShapeImage && hairColorImage ? (
              <TouchableOpacity
                className="bg-primary py-3 px-4 rounded-lg flex-1 ml-2.5 items-center justify-center"
                onPress={processImages}
                disabled={isProcessing}
              >
                <Text className="text-white font-semibold">Try On Now</Text>
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
                <Text className="text-white font-semibold">Tiếp tục</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            className="border border-primary py-3 px-7 rounded-3xl self-center"
            onPress={resetImages}
          >
            <Text className="text-primary font-semibold">
              Try Another Hairstyle
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

export default HairTryOnScreen;
