import Api from "./api";

class UserApi extends Api {
  constructor() {
    super("users");
  }

  async getUserInfo() {
    try {
      return await this.request("GET", "/me");
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  }
}

export default UserApi;
