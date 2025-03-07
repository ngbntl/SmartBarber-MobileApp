import { RegisterInterface, SignInInterface } from "@/types/auth";
import Api from "./api";

class AuthApi extends Api {
  constructor() {
    super("auth");
  }
  login(resource: SignInInterface) {
    return this.request("post", "/login", resource);
  }

  register(resource: RegisterInterface) {
    return this.request("post", "/register", resource);
  }
}

export default AuthApi;
