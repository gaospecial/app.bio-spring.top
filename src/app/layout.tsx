import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'Bio Spring - 综合业务管理平台',
  description: 'LLM 用量管理 · 数字土壤 · 考勤管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
