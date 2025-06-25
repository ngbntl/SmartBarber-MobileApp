import Api from "./api";

class AppointmentsApi extends Api {
  constructor() {
    super("appointments");
  }

  async getAppointments(userId: string) {
    try {
      return await this.request("get", `/user/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  async createAppointment(data: any) {
    try {
      return await this.request("post", "/", data);
    } catch (error) {
      throw error;
    }
  }

  async cancelAppointment(appointmentId: string) {
    try {
      return await this.request("put", `/cancel/${appointmentId}`);
    } catch (error) {
      throw error;
    }
  }

  async getStylistAppointments(stylistId: string) {
    try {
      return await this.request("get", `/stylist/${stylistId}`);
    } catch (error) {
      throw error;
    }
  }

  async stylistConfirmAppointment(appointmentId: string) {
    try {
      const response = await this.request("put", `/confirm/${appointmentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: string) {
    try {
      return await this.request("put", `/status/${appointmentId}`, {
        status,
      });
    } catch (error) {
      throw error;
    }
  }

  async markAppointmentCompleted(appointmentId: string) {
    try {
      return await this.updateAppointmentStatus(appointmentId, "completed");
    } catch (error) {
      throw error;
    }
  }

  async stylistCancelAppointment(
    appointmentId: string,
    emergencyReason: string
  ) {
    try {
      return await this.request("put", `/emergency-cancel/${appointmentId}`, {
        emergencyReason,
      });
    } catch (error) {
      throw error;
    }
  }
}

export default AppointmentsApi;
