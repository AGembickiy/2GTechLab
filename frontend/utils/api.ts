// API utils
export function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.NUXT_PUBLIC_API_BASE || '/api'
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

export async function handleApiError(error: unknown): Promise<string> {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Произошла неизвестная ошибка'
}
