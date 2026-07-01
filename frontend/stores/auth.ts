import { useStorage } from '@vueuse/core'

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
    accessToken: useStorage<string | null>('authAccessToken', null),
    refreshToken: useStorage<string | null>('authRefreshToken', null),
    isAuthenticated: false,
  }),
  getters: {
    getUser: (state) => state.user,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getUserRole: (state) => state.user?.role || 'client',
    getUserName: (state) => state.user?.username || 'Гость',
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
    setTokens(accessToken: string, refreshToken: string | null) {
      this.accessToken = accessToken
      if (refreshToken) {
        this.refreshToken = refreshToken
      }
    },
    clearAuth() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
    },
    logout() {
      this.clearAuth()
      navigateTo('/login')
    },
    async login(username: string, password: string) {
      try {
        const response = await $fetch('/api/v1/accounts/login/', {
          method: 'POST',
          body: { username, password },
        })

        this.setUser(response.user)
        this.setTokens(response.tokens.access, response.tokens.refresh)

        return response
      } catch (error: any) {
        throw new Error(error?.message || 'Не удалось войти в систему')
      }
    },
    async refreshToken() {
      if (!this.refreshToken) return

      try {
        const response = await $fetch('/api/token/refresh/', {
          method: 'POST',
          body: { refresh: this.refreshToken },
        })

        this.setTokens(response.access, this.refreshToken)
        return response
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },
  },
})
