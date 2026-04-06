const TOKEN_KEY = 'llm_usage_token'
const EXPIRES_KEY = 'llm_usage_token_expires'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, expiresIn: number): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresIn * 1000))
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}

export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true
  const expires = localStorage.getItem(EXPIRES_KEY)
  if (!expires) return true
  return Date.now() > Number(expires)
}

export function isLoggedIn(): boolean {
  return !!getToken() && !isTokenExpired()
}
