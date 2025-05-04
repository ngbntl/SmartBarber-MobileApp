import Api from "./api";

class ServicesApi extends Api {
  constructor() {
    super("services");
  }

  async getServices() {
    try {
      return await this.request("get", "/services");
    } catch (error) {
      throw error;
    }
  }
}

export default ServicesApi;
