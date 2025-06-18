import Api from "./api";

class HairStyleApi extends Api {
  constructor() {
    super("hairstyles");
  }

  async getAllStyles() {
    try {
      return await this.request("get", "/");
    } catch (error) {
      console.error("Error fetching hair styles:", error);
      return { data: [] };
    }
  }
}

export default HairStyleApi;
