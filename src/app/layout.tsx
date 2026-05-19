import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProviders } from '@/providers/QueryProviders'

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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="antialiased">
        <QueryProviders>
          <AuthProvider>{children}</AuthProvider>
        </QueryProviders>
      </body>
    </html>
  )
}
