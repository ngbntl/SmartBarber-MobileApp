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
}

export default AppointmentsApi;
