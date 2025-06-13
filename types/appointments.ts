export interface Appointment {
  id: string;
  serviceName: string;
  stylistName: string;
  appointmentDate: string;
  status: string;
  time: string;
  branchName?: string;
  services?: any[];
  startTime?: string;
  durationMinutes?: number;
  finalAmount?: string;
  isRated?: boolean;
}
