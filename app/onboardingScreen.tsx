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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import data from "@/assets/data/data";
import Pagination from "@/components/Pagination";
import CustomButton from "@/components/CustomButton";
export default function OnboardingScreen() {
  const router = useRouter();

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboarded", "true");
    } catch {
      console.error("Lỗi lưu trạng thái onboarded");
    } finally {
      router.replace("/(auth)");
    }
  };
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const flatListRef = useAnimatedRef<any>();
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const onViewableItemsChanged = ({ viewableItems }) => {
    flatListIndex.value = viewableItems[0].index;
  };
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });
  const RenderItem = ({ item, index }) => {
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
        <Animated.Image
          source={item.image}
          style={imageAnimationStyle}
          resizeMode="contain"
        />
        <Animated.View style={textAnimationStyle}>
          <Text className="text-center text-3xl text-white font-bold">
            {item.title}
          </Text>
          <Text className="text-center text-white">{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-violet-950">
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
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={data.length}
        />
      </View>
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
