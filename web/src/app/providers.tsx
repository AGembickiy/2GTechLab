"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store/store";
import { setCredentials } from "../store/slices/authSlice";

function AuthRehydrate() {
  const dispatch = useDispatch();
  useEffect(() => {
    const raw = localStorage.getItem("2gtechlab_auth");
    if (!raw) return;
    try {
      const { accessToken, userDisplay } = JSON.parse(raw);
      if (accessToken && userDisplay) {
        dispatch(setCredentials({ accessToken, userDisplay }));
      }
    } catch {
      // ignore
    }
  }, [dispatch]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthRehydrate />
      {children}
    </Provider>
  );
}

