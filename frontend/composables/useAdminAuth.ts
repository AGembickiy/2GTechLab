const ADMIN_ACCESS_TOKEN_KEY = '2gtl_admin_access_token'
const ADMIN_REFRESH_TOKEN_KEY = '2gtl_admin_refresh_token'

export function useAdminAuth() {
  const isAuthenticated = useState<boolean>('admin-auth', () => false)
  const accessToken = useState<string | null>('admin-access-token', () => null)
  const refreshToken = useState<string | null>('admin-refresh-token', () => null)
  const config = useRuntimeConfig()

  function hydrate() {
    if (import.meta.client) {
      accessToken.value = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)
      refreshToken.value = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY)
      isAuthenticated.value = Boolean(accessToken.value)
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const tokens = await $fetch<{ access: string; refresh: string }>(`${config.public.apiBase}/token/`, {
        method: 'POST',
        body: {
          username,
          password,
        },
      })

      accessToken.value = tokens.access
      refreshToken.value = tokens.refresh
      isAuthenticated.value = true

      if (import.meta.client) {
        localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, tokens.access)
        localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, tokens.refresh)
      }
      return true
    } catch {
      isAuthenticated.value = false
      accessToken.value = null
      refreshToken.value = null
      if (import.meta.client) {
        localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
        localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY)
      }
      return false
    }
  }

  function logout() {
    if (import.meta.client) {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY)
    }
    isAuthenticated.value = false
    accessToken.value = null
    refreshToken.value = null
  }

  return { isAuthenticated, accessToken, refreshToken, login, logout, hydrate }
}
