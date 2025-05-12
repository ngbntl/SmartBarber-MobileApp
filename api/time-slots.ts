import Api from "./api";

class TimeSlotsApi extends Api {
  constructor() {
    super("time-slots");
  }

  async getTimeSlotByStylistId(stylistId: string, date: string) {
    try {
      return await this.request(
        "get",
        "/stylist/" + stylistId + `?date=` + date
      );
    } catch (error) {
      throw error;
    }
  }
}

export default TimeSlotsApi;
