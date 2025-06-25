import Api from "./api";

class NotificationApi extends Api {
  constructor() {
    super("notifications");
  }
  getNotifications() {
    return this.request("get", `/`);
  }
  getUnreadCount() {
    return this.request("get", `/unread-count`);
  }
  getDetails(notificationId: string) {
    return this.request("get", `/${notificationId}`);
  }
  markAsRead(notificationId: string) {
    return this.request("patch", `/${notificationId}/read`);
  }
  markAllAsRead() {
    return this.request("patch", `/mark-all-read`);
  }
  registerPushToken(token: string) {
    return this.request("post", `/push-token`, { token });
  }
  unregisterPushToken(token: string) {
    return this.request("delete", `/unregister-push-token`, { token });
  }
}

export default NotificationApi;
