import Api from "./api";

class TokenApi extends Api {
  constructor() {
    super("token");
  }

  isValid(refreshToken: string) {
    return this.request("post", "/is-valid", { refreshToken });
  }

  accressToken(refreshToken: string) {
    return this.request("post", "/access-token", { refreshToken });
  }
}
export default TokenApi;
