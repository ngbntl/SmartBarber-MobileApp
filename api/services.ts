import Api from "./api";

class ServicesApi extends Api {
  constructor() {
    super("services");
  }

  async getServices() {
    try {
      return await this.request("get", "");
    } catch (error) {
      throw error;
    }
  }

  async getServiceById(id: string) {
    try {
      return await this.request("get", `/${id}`);
    } catch (error) {
      throw error;
    }
  }
}

export default ServicesApi;
