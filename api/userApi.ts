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

  async updateProfile(data: any) {
    try {
      return await this.request("PUT", "/profile", data);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async updateAvatar(formData: FormData) {
    try {
      return await this.request("POST", "/avatar", formData);
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  }
}

export default UserApi;
