import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  useWindowDimensions,
  Pressable,
  ViewToken,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import data from "@/assets/data/data";
import Pagination from "@/components/ui/Pagination";
import CustomButton from "@/components/button/CustomButton";
import { Colors } from "@/constants/Colors";
import { useState } from "react";
import LanguageDropdown from "@/components/ui/LanguageDropdown";
import { useLanguage } from "@/hooks/useLanguage";
import LottieView from "lottie-react-native";

interface OnboardingItem {
  id: number;
  title: string;
  description: string;
  image: any;
  isLottie: boolean;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboarded", "true");
    } catch {
      console.error("Lỗi lưu trạng thái onboarded");
    } finally {
      router.replace("/(auth)/login");
    }
  };
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const flatListRef = useAnimatedRef<any>();
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (viewableItems[0]) {
      flatListIndex.value = viewableItems[0].index || 0;
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const RenderItem = ({
    item,
    index,
  }: {
    item: OnboardingItem;
    index: number;
  }) => {
    const imageAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0, 1, 0],
        Extrapolate.CLAMP
      );
      const translateYAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [100, 0, 100],
        Extrapolate.CLAMP
      );
      return {
        opacity: opacityAnimation,
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.8,
        transform: [{ translateY: translateYAnimation }],
      };
    });
    const textAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0, 1, 0],
        Extrapolate.CLAMP
      );
      const translateYAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [100, 0, 100],
        Extrapolate.CLAMP
      );
      return {
        opacity: opacityAnimation,
        transform: [{ translateY: translateYAnimation }],
      };
    });
    return (
      <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
        {item.isLottie ? (
          <Animated.View style={imageAnimationStyle}>
            <LottieView
              source={item.image}
              style={{
                width: SCREEN_WIDTH * 0.8,
                height: SCREEN_WIDTH * 0.8,
                backgroundColor: Colors.primary,
                borderRadius: 20,
              }}
              autoPlay
              loop
              resizeMode="contain"
            />
          </Animated.View>
        ) : (
          <Animated.Image
            source={item.image}
            style={[
              imageAnimationStyle,
              {
                width: SCREEN_WIDTH * 0.8,
                height: SCREEN_WIDTH * 0.8,
                borderRadius: 20,
              },
            ]}
            resizeMode="contain"
          />
        )}
        <Animated.View style={textAnimationStyle}>
          <Text className="text-center text-3xl text-white font-bold">
            {t(`onboarding.slide${index + 1}.title`)}
          </Text>
          <Text className="text-center text-white">
            {t(`onboarding.slide${index + 1}.description`)}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="absolute top-5 right-5 z-10">
        <LanguageDropdown />
      </View>
      <Animated.FlatList
        ref={flatListRef}
        onScroll={onScroll}
        data={data}
        renderItem={({ item, index }) => {
          return <RenderItem item={item} index={index} />;
        }}
        keyExtractor={(item) => item.id.toString()}
        scrollEventThrottle={16}
        horizontal={true}
        bounces={false}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
      />
      <View className="flex-row justify-between items-center mx-5 my-5">
        <Pagination data={data} x={x} screenWidth={SCREEN_WIDTH} />
        <CustomButton
          title={t("common.getStarted")}
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={data.length}
          style={{ width: 200, height: 50 }}
        />
      </View>
      {currentIndex == data.length - 1 && (
        <View className="absolute flex-row left-1/2 -translate-x-1/2 gap-1 bottom-8">
          <Text className="text-white text-center">
            {t("auth.login.haveAccount")}
          </Text>
          <Pressable
            onPress={() => {
              router.replace("/(auth)/login");
            }}
          >
            <Text className="text-button font-bold"> {t("common.login")}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
