import { apiUrl } from "./api";
import { Notification, NotificationsResponse } from "@/types/notification";

class NotificationsApi {
  async getUserNotifications(params?: { page?: number; limit?: number; status?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await fetch(`${apiUrl}/notifications${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { statusCode: response.status, message: errorData.message };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        statusCode: 500,
        message: error.message || "common.error_occurred",
      };
    }
  }

  async getUnreadCount() {
    try {
      const response = await fetch(`${apiUrl}/notifications/unread-count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { statusCode: response.status, message: errorData.message };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        statusCode: 500,
        message: error.message || "common.error_occurred",
      };
    }
  }

  async getNotificationById(notificationId: string) {
    try {
      const response = await fetch(`${apiUrl}/notifications/${notificationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { statusCode: response.status, message: errorData.message };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        statusCode: 500,
        message: error.message || "common.error_occurred",
      };
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const response = await fetch(`${apiUrl}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { statusCode: response.status, message: errorData.message };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        statusCode: 500,
        message: error.message || "common.error_occurred",
      };
    }
  }

  async markAllAsRead() {
    try {
      const response = await fetch(`${apiUrl}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { statusCode: response.status, message: errorData.message };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        statusCode: 500,
        message: error.message || "common.error_occurred",
      };
    }
  }
}

export default NotificationsApi;