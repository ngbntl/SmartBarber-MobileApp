export interface MessageResponse {
  statusCode: number;
  message: string;
}

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  data?: {
    routeName?: string;
    params?: any;
  };
}

export interface NotificationsResponse {
  items: Notification[];
  totalCount: number;
}
