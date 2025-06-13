import Api from "./api";

class ReviewApi extends Api {
  constructor() {
    super("reviews");
  }

  async getReviews(stylistId: string) {
    try {
      return await this.request("get", "/stylist/" + stylistId);
    } catch (error) {
      throw error;
    }
  }

  async createReview(data: any) {
    try {
      return await this.request("post", "", data);
    } catch (error) {
      throw error;
    }
  }
}

export default ReviewApi;
