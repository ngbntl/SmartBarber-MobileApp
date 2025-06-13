import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import RatingModal from "../ui/RatingModal";

const { width } = Dimensions.get("window");

interface RatingPromptModalProps {
  visible: boolean;
  appointment: any;
  onClose: () => void;
  onRate: (appointmentId: string, rating: number, comment: string) => void;
  onSkip: () => void;
}

const RatingPromptModal = ({
  visible,
  appointment,
  onClose,
  onRate,
  onSkip,
}: RatingPromptModalProps) => {
  const { t } = useTranslation();
  const [showRatingModal, setShowRatingModal] = useState(false);

  if (!appointment) return null;

  const handleRateNow = () => {
    setShowRatingModal(true);
  };

  const handleRateSubmit = (rating: number, comment: string) => {
    onRate(appointment.id, rating, comment);
    setShowRatingModal(false);
  };

  const handleRateModalClose = () => {
    setShowRatingModal(false);
    onSkip();
  };

  return (
    <>
      <Modal
        transparent={true}
        visible={visible && !showRatingModal}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>

                <View style={styles.header}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={
                        appointment.stylistAvatar
                          ? { uri: appointment.stylistAvatar }
                          : require("@/assets/images/default-avatar.png")
                      }
                      style={styles.stylistImage}
                    />
                    <View style={styles.successBadge}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  </View>
                </View>

                <Text style={styles.title}>{t("ratings.prompt_title")}</Text>

                <Text style={styles.description}>
                  {t("ratings.prompt_description", {
                    stylist: appointment.stylistName,
                    service:
                      appointment.services?.[0]?.service?.name ||
                      t("common.service"),
                  })}
                </Text>

                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={handleRateNow}
                >
                  <Text style={styles.rateButtonText}>
                    {t("ratings.rate_now")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                  <Text style={styles.skipButtonText}>
                    {t("ratings.maybe_later")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {showRatingModal && (
        <RatingModal
          visible={showRatingModal}
          stylistName={appointment.stylistName}
          onClose={handleRateModalClose}
          onSubmit={handleRateSubmit}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width - 40,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 1,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  stylistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  successBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
    paddingHorizontal: 10,
  },
  rateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  rateButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    color: "#999",
    fontSize: 14,
  },
});

export default RatingPromptModal;
