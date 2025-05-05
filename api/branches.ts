import Api from "./api";

class BranchesApi extends Api {
  constructor() {
    super("branches");
  }

  async getBranches() {
    try {
      return await this.request("get", "");
    } catch (error) {
      throw error;
    }
  }
}

export default BranchesApi;
