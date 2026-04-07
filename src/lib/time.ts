/**
 * 时间格式化工具
 *
 * 后端时间戳有两种格式：
 * 1. Naive UTC datetime（传感器数据）：如 "2026-04-07T10:00:00"，无时区后缀
 * 2. Timezone-aware datetime（APScheduler）：如 "2026-04-08 05:40:00+00:00"，含时区
 *
 * 两种格式都先解析为 Date 对象，再转换为本地时间显示。
 */
function parseTimestamp(ts: string): Date {
  // 已含时区信息（+00:00, -05:00, Z 等），直接解析
  if (/[+-]\d{2}:?\d{2}$/.test(ts) || ts.endsWith('Z')) {
    return new Date(ts)
  }
  // Naive datetime，按 UTC 解析
  return new Date(ts + 'Z')
}

/** 将时间戳转为本地时间的 "YYYY/MM/DD HH:mm:ss" 格式 */
export function formatDateTime(timestamp: string): string {
  const d = parseTimestamp(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 将时间戳转为本地时间的 "YYYY/MM/DD" 格式 */
export function formatDate(timestamp: string): string {
  const d = parseTimestamp(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}
