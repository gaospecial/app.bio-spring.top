// ── 标准 API 响应信封 ──

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  meta?: {
    page?: number
    page_size?: number
    total?: number
    total_pages?: number
  }
}

// ── Auth ──

export interface TokenData {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string | null
}

export interface UserResponse {
  id: number
  username: string
  display_name: string | null
  role: string
  is_active: boolean
  created_at: string
}

// ── API Key ──

export interface ApiKey {
  id: number
  name: string
  api_key: string
  base_url: string
  is_active: boolean
  balance_total: string | null
  balance_used: string | null
  balance_updated: string | null
  created_at: string
  updated_at: string
}

export interface ApiKeyCreate {
  name: string
  api_key: string
  base_url?: string
  is_active?: boolean
}

export interface ApiKeyUpdate {
  name?: string
  api_key?: string
  base_url?: string
  is_active?: boolean
}

// ── 采集结果 ──

export interface CollectResult {
  key_id: number
  collected_at: string
  records_inserted: number
  details_inserted: number
}

// ── 用量汇总 ──

export interface KeySummary {
  key_id: number
  key_name: string
  total_granted: string
  total_used: string
  last_collected_at: string | null
}

export interface UsageSummary {
  total_keys: number
  active_keys: number
  total_granted: string
  total_used: string
  total_remaining: string
  keys: KeySummary[]
}

// ── 每日用量 ──

export interface DailyKeyUsage {
  key_id: number
  usage: string
  tokens: number
}

export interface DailyUsage {
  date: string
  total_usage: string
  total_tokens: number
  keys: DailyKeyUsage[]
}

// ── 按 KEY 统计 ──

export interface ByKeyUsage {
  key_id: number
  key_name: string
  total_usage: string
  total_input_tokens: number
  total_output_tokens: number
  request_days: number
  avg_daily_usage: string
}

// ── 按模型统计 ──

export interface ByModelUsage {
  model_name: string
  model_id: string | null
  total_cost: string
  total_input_tokens: number
  total_output_tokens: number
  request_count: number
}

// ── 用量明细 ──

export interface UsageDetailItem {
  id: number
  api_key_id: number
  date: string
  model_name: string
  model_id: string | null
  input_tokens: number
  output_tokens: number
  total_cost: string
  collected_at: string
}

export interface DetailQuery {
  key_id?: number
  date?: string
  model_name?: string
  page?: number
  page_size?: number
}
