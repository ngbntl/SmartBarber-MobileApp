import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/store";
import AppointmentsApi from "@/api/appointments";
import RatingsApi from "@/api/reviews";
import ReviewApi from "@/api/reviews";

const STORAGE_KEY_PREFIX = "@rating_prompt_dismissed:";
const RATING_PROMPT_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Hook để quản lý việc hiển thị popup nhắc người dùng đánh giá
 */
const useRatingPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const [pendingRatingAppointments, setPendingRatingAppointments] = useState<
    any[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state: RootState) => state.auth.userInfo);
  const appointmentsApi = new AppointmentsApi();
  const ratingsApi = new RatingsApi();

  const loadPendingRatingAppointments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Lấy tất cả cuộc hẹn của người dùng
      const response = await appointmentsApi.getAppointments(user.id);
      const appointments = response.items || [];

      // Lọc ra các cuộc hẹn đã hoàn thành nhưng chưa được đánh giá
      const pendingRatings = appointments.filter(
        (appointment) =>
          appointment.status?.toLowerCase() === "completed" &&
          !appointment.isReviewed
      );

      setPendingRatingAppointments(pendingRatings);

      // Nếu có cuộc hẹn chưa đánh giá, kiểm tra xem có nên hiển thị popup không
      if (pendingRatings.length > 0) {
        checkAndShowPrompt(pendingRatings);
      }
    } catch (error) {
      console.error("Error loading pending rating appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Kiểm tra và hiển thị popup nếu phù hợp
  const checkAndShowPrompt = async (appointments: any[]) => {
    if (!appointments.length) return;

    // Sắp xếp các cuộc hẹn theo thời gian, mới nhất lên đầu
    const sortedAppointments = [...appointments].sort(
      (a, b) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime()
    );

    for (const appointment of sortedAppointments) {
      const storageKey = `${STORAGE_KEY_PREFIX}${appointment.id}`;
      const dismissedTime = await AsyncStorage.getItem(storageKey);

      // Nếu chưa từng bỏ qua hoặc đã qua thời gian "mát", hiển thị thông báo
      if (
        !dismissedTime ||
        Date.now() - parseInt(dismissedTime) > RATING_PROMPT_COOLDOWN
      ) {
        setCurrentAppointment(appointment);
        setShowPrompt(true);
        return;
      }
    }
  };

  const handleRate = async (
    appointmentId: string,
    rating: number,
    comment: string
  ) => {
    try {
      if (!appointmentId) return;
      const reviewApi = new ReviewApi();
      await reviewApi.createReview({
        appointmentId: appointmentId,
        rating: rating,
        comment: comment,
      });

      setPendingRatingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );

      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${appointmentId}`,
        Date.now().toString()
      );

      setShowPrompt(false);
      setCurrentAppointment(null);

      return true;
    } catch (error) {
      console.error("Error submitting rating:", error);
      return false;
    }
  };

  const handleSkip = async () => {
    if (currentAppointment?.id) {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${currentAppointment.id}`,
        Date.now().toString()
      );
    }

    setShowPrompt(false);
    setCurrentAppointment(null);
  };

  // Kiểm tra khi ứng dụng trở lại từ background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          loadPendingRatingAppointments();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [loadPendingRatingAppointments]);

  // Kiểm tra khi component được mount
  useEffect(() => {
    loadPendingRatingAppointments();
  }, [loadPendingRatingAppointments]);

  return {
    showPrompt,
    currentAppointment,
    pendingRatingAppointments,
    isLoading,
    handleRate,
    handleSkip,
    loadPendingRatingAppointments,
  };
};

export default useRatingPrompt;
