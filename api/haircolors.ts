import Api from "./api";

class HairColorApi extends Api {
  constructor() {
    super("haircolors");
  }

  async getAllColors() {
    try {
      return await this.request("get", "/");
    } catch (error) {
      console.error("Error fetching hair colors:", error);
      return { items: [] };
    }
  }
}

export default HairColorApi;
