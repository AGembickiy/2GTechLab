import { defineStore } from 'pinia'

interface AuthState {
  user: {
    id: number
    username: string
    email: string
    role: string
    phone?: string
    address?: string
  } | null

  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

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
      this.user = user
      this.isAuthenticated = !!user
    },

    setTokens(accessToken: string, refreshToken: string | null = null) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
    },

    clearAuth() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
    },

    logout() {
      this.clearAuth()
    },
  },
})