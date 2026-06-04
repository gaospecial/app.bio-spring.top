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
  modules: string[]
}

export interface ModuleInfo {
  id: string
  label: string
  icon: string
}

// ── API Key ──

export interface ApiKey {
  id: number
  name: string
  api_key: string
  provider: string
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
  provider?: string
  base_url?: string
  is_active?: boolean
}

export interface ApiKeyUpdate {
  name?: string
  api_key?: string
  provider?: string
  base_url?: string
  is_active?: boolean
}

export interface LlmProviderInfo {
  type: string
  name: string
  description: string
  base_url: string
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
  call_count: number
}

export interface DailyUsage {
  date: string
  total_usage: string
  total_tokens: number
  keys: DailyKeyUsage[]
}

export interface DailyModelUsage {
  date: string
  model_name: string
  input_tokens: number
  output_tokens: number
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

// ── Soil / 数字土壤 ──

export interface SoilDashboard {
  total_providers: number
  active_providers: number
  total_sensors: number
  active_sensors: number
  online_sensors: number
  offline_sensors: number
  today_data_points: number
  latest_update: string | null
}

export interface ProviderResponse {
  id: number
  name: string
  api_base_url: string
  is_active: boolean
  sensor_count: number
  created_at: string
}

export interface ProviderDetail extends ProviderResponse {
  api_key: string
  config: string | null
  updated_at: string
}

export interface ProviderCreate {
  name: string
  api_base_url: string
  api_key: string
  config?: string
  is_active?: boolean
}

export interface ProviderUpdate {
  name?: string
  api_base_url?: string
  api_key?: string
  config?: string
  is_active?: boolean
}

export interface SensorResponse {
  id: number
  provider_id: number
  sensor_sn: string
  name: string
  location: string | null
  unit: string | null
  is_active: boolean
  latest_value: string | null
  latest_time: string | null
  created_at: string
}

export interface SensorCreate {
  provider_id: number
  sensor_sn: string
  name: string
  location?: string
  unit?: string
  is_active?: boolean
}

export interface SensorUpdate {
  name?: string
  location?: string
  unit?: string
  is_active?: boolean
}

export interface SensorValueItem {
  sensor_id: number
  value: string
  collected_at: string
}

export interface SensorLatestResponse {
  sensor_id: number
  sensor_name: string
  value: string
  unit: string | null
  collected_at: string
}

export interface OHLCItem {
  interval_start: string
  open: string
  high: string
  low: string
  close: string
  count: number
}

// ── Biogas / 还田科普 ──

export type BiogasPaper = {
  id: number
  title: string | null
  authors: string | null
  journal: string | null
  year: number | null
  file_size: number | null
  status: string
  error_message: string | null
  article_id: string | null
  created_at: string | null
}

export type BiogasArticle = {
  id: string
  title: string
  subtitle: string | null
  slug: string
  category: string | null
  tags: string[] | null
  slurry_type: string | null
  crop: string | null
  soil_type: string | null
  dosage: string | null
  application_method: string | null
  yield_benefit: string | null
  quality_benefit: string | null
  risk_control: string | null
  understanding_points: string[] | null
  content_md: string | null
  source_citation: string | null
  authors: string | null
  status: string
  paper_id: number | null
  published_at: string | null
  created_at: string | null
  updated_at: string | null
}
