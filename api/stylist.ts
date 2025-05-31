import Api from "./api";

class StylistApi extends Api {
  constructor() {
    super("stylists");
  }

  async getStylistByBranchId(branchId: string) {
    try {
      return await this.request("get", "/branch/" + branchId);
    } catch (error) {
      throw error;
    }
  }

  async getStylistSchedule(stylistId: string) {
    try {
      return await this.request("get", `/schedule/${stylistId}`);
    } catch (error) {
      throw error;
    }
  }

  async getStylistDaysOff(stylistId: string) {
    try {
      return await this.request("get", `/time-offs/${stylistId}`);
    } catch (error) {
      throw error;
    }
  }

  async addDayOff(data: any) {
    try {
      return await this.request("post", `/time-off`, data);
    } catch (error) {
      throw error;
    }
  }

  async removeDayOff(dayOffId: string) {
    try {
      return await this.request("delete", `/time-off/${dayOffId}`);
    } catch (error) {
      throw error;
    }
  }

  async getReviews(stylistId: string) {
    try {
      return await this.request("get", `/reviews/${stylistId}`);
    } catch (error) {
      throw error;
    }
  }
}

export default StylistApi;
