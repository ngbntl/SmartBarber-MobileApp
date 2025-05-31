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
}

export default AppointmentsApi;
