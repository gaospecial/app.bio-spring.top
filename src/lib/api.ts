import axios from 'axios'
import { getToken, clearToken } from './auth'
import type {
  ApiResponse,
  TokenData,
  UserResponse,
  ApiKey,
  ApiKeyCreate,
  ApiKeyUpdate,
  CollectResult,
  UsageSummary,
  DailyUsage,
  ByKeyUsage,
  ByModelUsage,
  UsageDetailItem,
  DetailQuery,
} from './types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：附加 token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 跳转登录，解包 data
api.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiResponse<unknown>
    if (envelope.code !== 0) {
      throw new Error(envelope.message || '请求失败')
    }
    // Overwrite response.data with the unwrapped payload
    response.data = envelope
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)

// ── Auth ──

export async function login(username: string, password: string): Promise<TokenData> {
  const res = await api.post('/api/v1/auth/login', { username, password })
  return (res.data as ApiResponse<TokenData>).data
}

export async function getMe(): Promise<UserResponse> {
  const res = await api.get('/api/v1/auth/me')
  return (res.data as ApiResponse<UserResponse>).data
}

// ── Keys ──

export async function listKeys(): Promise<ApiKey[]> {
  const res = await api.get('/api/v1/llm/keys')
  return (res.data as ApiResponse<ApiKey[]>).data
}

export async function createKey(data: ApiKeyCreate): Promise<ApiKey> {
  const res = await api.post('/api/v1/llm/keys', data)
  return (res.data as ApiResponse<ApiKey>).data
}

export async function updateKey(id: number, data: ApiKeyUpdate): Promise<ApiKey> {
  const res = await api.put(`/api/v1/llm/keys/${id}`, data)
  return (res.data as ApiResponse<ApiKey>).data
}

export async function deleteKey(id: number): Promise<void> {
  await api.delete(`/api/v1/llm/keys/${id}`)
}

export async function collectKey(id: number): Promise<CollectResult> {
  const res = await api.post(`/api/v1/llm/keys/${id}/collect`)
  return (res.data as ApiResponse<CollectResult>).data
}

// ── Usage ──

export async function getSummary(): Promise<UsageSummary> {
  const res = await api.get('/api/v1/llm/usage/summary')
  return (res.data as ApiResponse<UsageSummary>).data
}

export async function getDailyUsage(days = 30, keyId?: number): Promise<DailyUsage[]> {
  const params: Record<string, string> = { days: String(days) }
  if (keyId) params.key_id = String(keyId)
  const res = await api.get('/api/v1/llm/usage/daily', { params })
  return (res.data as ApiResponse<DailyUsage[]>).data
}

export async function getByKeyUsage(days = 30): Promise<ByKeyUsage[]> {
  const res = await api.get('/api/v1/llm/usage/by-key', { params: { days: String(days) } })
  return (res.data as ApiResponse<ByKeyUsage[]>).data
}

export async function getByModelUsage(keyId?: number, date?: string): Promise<ByModelUsage[]> {
  const params: Record<string, string> = {}
  if (keyId) params.key_id = String(keyId)
  if (date) params.date = date
  const res = await api.get('/api/v1/llm/usage/by-model', { params })
  return (res.data as ApiResponse<ByModelUsage[]>).data
}

export async function getDetails(query: DetailQuery): Promise<{
  items: UsageDetailItem[]
  meta: { page: number; page_size: number; total: number; total_pages: number }
}> {
  const params: Record<string, string> = {}
  if (query.key_id) params.key_id = String(query.key_id)
  if (query.date) params.date = query.date
  if (query.model_name) params.model_name = query.model_name
  if (query.page) params.page = String(query.page)
  if (query.page_size) params.page_size = String(query.page_size)
  const res = await api.get('/api/v1/llm/usage/details', { params })
  const envelope = res.data as ApiResponse<UsageDetailItem[]>
  const fallback = { page: 1, page_size: 20, total: 0, total_pages: 0 }
  return {
    items: envelope.data,
    meta: envelope.meta ? { ...fallback, ...envelope.meta } : fallback,
  }
}

export default api
