export interface RegisterInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInInterface {
  email: string;
  password: string;
}

export interface VerifyEmailInterface {
  email: string;
  otpCode: string;
}
