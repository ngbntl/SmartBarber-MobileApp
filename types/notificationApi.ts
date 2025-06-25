export type NotificationApiType =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "promotion"
  | "appointment"
  | "system";

export interface NotificationApi {
  id: string;
  title: string;
  content: string;
  type: NotificationApiType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  referenceId?: string;
}

export interface NotificationsApiResponse {
  data: NotificationApi[];
  total?: number;
  page?: number;
  limit?: number;
}
