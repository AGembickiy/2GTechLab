import { useAuthStore } from '@/stores/auth'

export class AuthService {
  private baseUrl = '/v1/accounts'

  private get api() {
    return useNuxtApp().$api
  }

  private get authStore() {
    return useAuthStore()
  }

  async login(username: string, password: string): Promise<any> {
    const response = await this.api(`${this.baseUrl}/login/`, {
      method: 'POST',
      body: {
        username,
        password,
      },
    })

    if (response?.tokens) {
      this.authStore.setTokens(
        response.tokens.access,
        response.tokens.refresh,
      )
    }

    if (response?.user) {
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
  }

  async logout(): Promise<void> {
    try {
      await this.api(`${this.baseUrl}/logout/`, {
        method: 'POST',
      })
    } finally {
      this.authStore.logout()
    }
  }

  async register(
    username: string,
    email: string,
    password: string,
    phone: string,
    role: string = 'client',
  ): Promise<any> {
    return await this.api(`${this.baseUrl}/register/`, {
      method: 'POST',
      body: {
        username,
        email,
        password,
        phone,
        role,
      },
    })
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.api(`${this.baseUrl}/me/`)

    if (response?.user) {
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
  }

  async updateProfile(payload: any): Promise<any> {
    return await this.api(`${this.baseUrl}/profile/`, {
      method: 'PUT',
      body: payload,
    })
  }

  async refreshTokens(): Promise<any> {
    const response = await this.api('/token/refresh/', {
      method: 'POST',
      body: {
        refresh: this.authStore.refreshToken,
      },
    })

    if (response?.access) {
      this.authStore.setTokens(
        response.access,
        this.authStore.refreshToken,
      )
    }

    return response
  }
}

export const authService = new AuthService()