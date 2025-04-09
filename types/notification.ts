export interface MessageResponse {
  statusCode: number;
  message: string;
}

export type NotificationType = "success" | "error" | "info" | "warning";
