import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  BackHandler,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Portal } from "@gorhom/portal";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";

interface RatingModalProps {
  visible: boolean;
  stylistName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const { width, height } = Dimensions.get("window");

const RatingModal = ({
  visible,
  stylistName,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: RatingModalProps) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [opacity] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setRating(0);
      setComment("");
    }
  }, [visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (visible && !isSubmitting) {
          handleClose();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [visible, isSubmitting]);

  const animateClose = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleSubmit = () => {
    if (rating === 0 || isSubmitting) return;
    onSubmit(rating, comment);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      Keyboard.dismiss();
      animateClose(onClose);
    }
  };

  const handleBackdropPress = () => {
    if (!isSubmitting) {
      Keyboard.dismiss();
      handleClose();
    }
  };

  // Không hiển thị nếu không được cấu hình để hiển thị
  if (!visible) return null;

  return (
    <Portal>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: opacity,
                transform: [{ scale: scale }],
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{t("ratings.rate_experience")}</Text>
              {!isSubmitting && (
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.subtitle}>
              {t("ratings.rate_stylist", { name: stylistName })}
            </Text>

            {/* Rating Stars */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => !isSubmitting && setRating(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name={rating >= star ? "star" : "star-outline"}
                    size={36}
                    color={rating >= star ? "#FFD700" : "#CCCCCC"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingText}>
              {rating > 0
                ? t(`ratings.rating_${rating}`)
                : t("ratings.tap_to_rate")}
            </Text>

            {/* Comment Input */}
            <TextInput
              style={[styles.commentInput, isSubmitting && { opacity: 0.7 }]}
              placeholder={t("ratings.leave_comment")}
              placeholderTextColor="#999"
              value={comment}
              onChangeText={(text) => !isSubmitting && setComment(text)}
              multiline={true}
              numberOfLines={4}
              editable={!isSubmitting}
              textAlignVertical="top"
            />

            {/* Error message */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || isSubmitting) && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonText}>
                    {t("common.submitting")}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {t("ratings.submit_rating")}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  starButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default RatingModal;
