import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  username: string;
  token: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null, // Trạng thái mặc định: chưa đăng nhập
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
