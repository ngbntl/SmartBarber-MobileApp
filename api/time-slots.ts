import Api from "./api";
import { formatShortDate } from "@/utils/functions";

class TimeSlotsApi extends Api {
  constructor() {
    super("time-slots");
  }

  async getTimeSlotByStylistId(stylistId: string, date: Date | string) {
    try {
      // Format the date properly using our utility function
      const formattedDate =
        typeof date === "string" ? date : formatShortDate(date, "-");

      return await this.request(
        "get",
        "/stylist/" + stylistId + `?date=` + formattedDate
      );
    } catch (error) {
      throw error;
    }
  }
}

export default TimeSlotsApi;
