import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const AUTH_STORAGE_KEY = "2gtechlab_auth";

function loadStored(): { accessToken: string; userDisplay: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { accessToken: string; userDisplay: string };
    return data.accessToken && data.userDisplay ? data : null;
  } catch {
    return null;
  }
}

function saveStored(accessToken: string, userDisplay: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, userDisplay }));
}

function clearStored() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  userDisplay?: string;
}

const stored = loadStored();
const initialState: AuthState = {
  isAuthenticated: !!stored,
  accessToken: stored?.accessToken,
  userDisplay: stored?.userDisplay,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string; userDisplay: string }>,
    ) {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.userDisplay = action.payload.userDisplay;
      saveStored(action.payload.accessToken, action.payload.userDisplay);
    },
    clearCredentials(state) {
      state.isAuthenticated = false;
      state.accessToken = undefined;
      state.userDisplay = undefined;
      clearStored();
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserDisplay = (state: { auth: AuthState }) => state.auth.userDisplay;
export default authSlice.reducer;

