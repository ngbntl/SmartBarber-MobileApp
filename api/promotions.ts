import Api from "./api";

class PromotionsApi extends Api {
  constructor() {
    super("promotions");
  }

  async getPromotions() {
    try {
      return await this.request("get", "");
    } catch (error) {
      throw error;
    }
  }
}

export default PromotionsApi;
