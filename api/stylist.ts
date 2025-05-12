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
      return await this.request("get", "/schedule/" + stylistId);
    } catch (error) {
      throw error;
    }
  }
}

export default StylistApi;
