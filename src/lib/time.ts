/**
 * 时间格式化工具
 *
 * 后端所有时间戳均为 UTC（naive datetime，无时区后缀），
 * 例如 "2026-04-07T10:00:00"。
 * 前端统一按 UTC 解析后转换为本地时间显示。
 */

/** 将 UTC 时间戳转为本地时间的 "YYYY/MM/DD HH:mm:ss" 格式 */
export function formatDateTime(utcTimestamp: string): string {
  const d = new Date(utcTimestamp + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 将 UTC 时间戳转为本地时间的 "YYYY/MM/DD" 格式 */
export function formatDate(utcTimestamp: string): string {
  const d = new Date(utcTimestamp + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}
