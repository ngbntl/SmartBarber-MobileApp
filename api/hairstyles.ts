import Api from "./api";

class HairStyleApi extends Api {
  constructor() {
    super("hairstyles");
  }

  async getHairStyles() {
    try {
      return await this.request("get", "/");
    } catch (error) {
      throw error;
    }
  }
}

export default HairStyleApi;
