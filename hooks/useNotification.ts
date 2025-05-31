import { useState } from "react";
import { MessageResponse, NotificationType } from "@/types/notification";
import { useLanguage } from "./useLanguage";

export const useNotification = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  const { t } = useLanguage();

  const getNotificationType = (statusCode: number): NotificationType => {
    if (statusCode >= 200 && statusCode < 300) return "success";
    if (statusCode >= 300 && statusCode < 600) return "error";
    return "warning";
  };

  const appNotification = (messageResponse: MessageResponse) => {
    const type = getNotificationType(messageResponse?.statusCode);

    setToast({
      message: t(messageResponse.message),
      type,
    });
  };

  return { appNotification, toast, setToast };
};
