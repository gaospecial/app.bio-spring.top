'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

export default function ProfilePage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }
    if (newPassword.length < 6) {
      setError('新密码至少 6 位')
      return
    }

    setSaving(true)
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword })
      setSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h2 className="text-lg font-semibold mb-6">修改密码</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="当前密码"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <Input
            label="新密码"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="确认新密码"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm border bg-red-50 text-red-800 border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg px-4 py-3 text-sm border bg-green-50 text-green-800 border-green-200">
              密码修改成功
            </div>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '修改密码'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
