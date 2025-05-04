import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  username: string;
  accessToken: string;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  userInfo: UserInfo | null;
}

const initialState: AuthState = {
  user: null,
  userInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userInfo = null;
    },
  },
});

export const { login, setUserInfo, logout } = authSlice.actions;
export default authSlice.reducer;
