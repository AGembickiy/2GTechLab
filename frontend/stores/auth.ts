import { defineStore } from 'pinia';

interface AuthState {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
  } | null;

  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const ACCESS_TOKEN_COOKIE = 'techlab-access-token';
const REFRESH_TOKEN_COOKIE = 'techlab-refresh-token';
const USER_COOKIE = 'techlab-auth-user';

const cookieOptions = {
  sameSite: 'lax' as const,
  secure: import.meta.env.PROD,
  path: '/',
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  }),

  getters: {
    getUser: (state) => state.user,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getUserRole: (state) => state.user?.role ?? 'client',
    getUserName: (state) => state.user?.username ?? 'Гость',

    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager',
    isClient: (state) => state.user?.role === 'client',
    isPartner: (state) => state.user?.role === 'partner',
  },

  actions: {
    setUser(user: AuthState['user']) {
      this.user = user;
      this.isAuthenticated = !!user;

      const userCookie = useCookie<AuthState['user'] | null>(
        USER_COOKIE,
        cookieOptions,
      );

      userCookie.value = user;
    },

    setTokens(accessToken: string, refreshToken: string | null = null) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      const accessTokenCookie = useCookie<string | null>(
        ACCESS_TOKEN_COOKIE,
        cookieOptions,
      );

      const refreshTokenCookie = useCookie<string | null>(
        REFRESH_TOKEN_COOKIE,
        cookieOptions,
      );

      accessTokenCookie.value = accessToken;
      refreshTokenCookie.value = refreshToken;
    },

    hydrate() {
      const accessTokenCookie = useCookie<string | null>(
        ACCESS_TOKEN_COOKIE,
        cookieOptions,
      );

      const refreshTokenCookie = useCookie<string | null>(
        REFRESH_TOKEN_COOKIE,
        cookieOptions,
      );

      const userCookie = useCookie<AuthState['user'] | null>(
        USER_COOKIE,
        cookieOptions,
      );

      this.accessToken = accessTokenCookie.value;
      this.refreshToken = refreshTokenCookie.value;
      this.user = userCookie.value;
      this.isAuthenticated = !!this.accessToken && !!this.user;
    },

    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;

      const accessTokenCookie = useCookie<string | null>(
        ACCESS_TOKEN_COOKIE,
        cookieOptions,
      );

      const refreshTokenCookie = useCookie<string | null>(
        REFRESH_TOKEN_COOKIE,
        cookieOptions,
      );

      const userCookie = useCookie<AuthState['user'] | null>(
        USER_COOKIE,
        cookieOptions,
      );

      accessTokenCookie.value = null;
      refreshTokenCookie.value = null;
      userCookie.value = null;
    },

    logout() {
      this.clearAuth();
    },
  },
});
