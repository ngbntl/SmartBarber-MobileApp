import {
  RegisterInterface,
  SignInInterface,
  VerifyEmailInterface,
} from "@/types/auth";
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

  verifyEmail(resource: VerifyEmailInterface) {
    return this.request("post", "/verify-email", resource);
  }

  resendOTP(resource: { email: string }) {
    return this.request("post", "/send-verify-email", resource);
  }
}

export default AuthApi;
