import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import AppointmentsApi from "@/api/appointments";

/**
 * Hook để tự động kiểm tra và cập nhật trạng thái cuộc hẹn
 * @param appointments Danh sách cuộc hẹn cần kiểm tra
 * @param onStatusChange Callback gọi khi có thay đổi trạng thái
 */
const useAppointmentStatusCheck = (
  appointments: any[],
  onStatusChange: (updatedAppointments: any[]) => void
) => {
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const appointmentsApi = new AppointmentsApi();

  const checkAppointmentStatuses = useCallback(async () => {
    if (!appointments || appointments.length === 0) {
      return;
    }

    const now = new Date();
    const updatedAppointments = [...appointments];
    let hasChanges = false;

    // Lọc những cuộc hẹn đã xác nhận và đến giờ
    const confirmedAppointments = updatedAppointments.filter(
      (appointment) => appointment.status?.toLowerCase() === "confirmed"
    );

    for (const appointment of confirmedAppointments) {
      const appointmentTime = new Date(appointment.appointmentDate);

      // Nếu đã qua thời gian cuộc hẹn 15 phút và vẫn ở trạng thái "confirmed"
      // thì tự động đánh dấu là đã hoàn thành
      if (appointmentTime.getTime() + 15 * 60000 < now.getTime()) {
        try {
          // Gọi API để cập nhật trạng thái
          await appointmentsApi.markAppointmentCompleted(appointment.id);

          // Cập nhật trạng thái trong mảng local
          const index = updatedAppointments.findIndex(
            (a) => a.id === appointment.id
          );
          if (index !== -1) {
            updatedAppointments[index].status = "completed";
            hasChanges = true;
          }
        } catch (error) {
          console.error(
            `Failed to auto-complete appointment ${appointment.id}:`,
            error
          );
        }
      }
    }

    if (hasChanges) {
      onStatusChange(updatedAppointments);
    }

    setLastCheckTime(now);
  }, [appointments, appointmentsApi, onStatusChange]);

  // Kiểm tra trạng thái cuộc hẹn mỗi khi ứng dụng chuyển về foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkAppointmentStatuses();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [checkAppointmentStatuses]);

  // Kiểm tra định kỳ mỗi phút
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkAppointmentStatuses();
    }, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(intervalId);
  }, [checkAppointmentStatuses]);

  // Kiểm tra ngay khi component được mount hoặc appointments thay đổi
  useEffect(() => {
    checkAppointmentStatuses();
  }, [appointments]);

  return { lastCheckTime };
};

export default useAppointmentStatusCheck;
