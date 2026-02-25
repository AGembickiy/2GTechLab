import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  userEmail?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string; userEmail: string }>,
    ) {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.userEmail = action.payload.userEmail;
    },
    clearCredentials(state) {
      state.isAuthenticated = false;
      state.accessToken = undefined;
      state.userEmail = undefined;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

