import { useAuthStore } from '@/stores/auth'

export class AuthService {
  private baseUrl = '/api/v1/accounts'
  private authStore = useAuthStore()

  async login(username: string, password: string): Promise<any> {
    try {
      const response = await $fetch(`${this.baseUrl}/login/`, {
        method: 'POST',
        body: { username, password },
      })

      if (response.tokens) {
        this.authStore.setTokens(response.tokens.access, response.tokens.refresh)
      }

      if (response.user) {
        this.authStore.setUser({
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role || 'client',
          phone: response.user.profile?.phone,
          address: response.user.profile?.address,
        })
      }

      return response
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await $fetch(`${this.baseUrl}/logout/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.authStore.accessToken}`,
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.authStore.logout()
    }
  }

  async register(username: string, email: string, password: string, phone: string, role: string = 'client'): Promise<any> {
    try {
      const response = await $fetch(`${this.baseUrl}/register/`, {
        method: 'POST',
        body: { username, email, password, phone, role },
      })

      return response
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await $fetch(`${this.baseUrl}/me/`, {
        headers: {
          Authorization: `Bearer ${this.authStore.accessToken}`,
        },
      })

      if (response.user) {
        this.authStore.setUser({
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role || 'client',
          phone: response.user.profile?.phone,
          address: response.user.profile?.address,
        })
      }

      return response
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  async updateProfile(payload: any): Promise<any> {
    try {
      const response = await $fetch(`${this.baseUrl}/profile/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.authStore.accessToken}`,
        },
        body: payload,
      })

      return response
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  async refreshTokens(): Promise<any> {
    try {
      const response = await $fetch('/api/token/refresh/', {
        method: 'POST',
        body: { refresh: this.authStore.refreshToken },
      })

      if (response.access) {
        this.authStore.setTokens(response.access, this.authStore.refreshToken)
      }

      return response
    } catch (error) {
      console.error('Token refresh error:', error)
      this.authStore.logout()
      throw error
    }
  }
}

export const authService = new AuthService()
