"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { changePasswordAction } from "@/app/actions/auth"
import { Eye, EyeOff } from "lucide-react"

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp")
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    setLoading(true)
    const result = await changePasswordAction(currentPassword, newPassword)

    if (!result.success) {
      setError(result.error || "Đã xảy ra lỗi")
    } else {
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
    }
    setLoading(false)
  }

  const handleClose = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Đổi mật khẩu" size="sm">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Mật khẩu hiện tại */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="current-password">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="new-password">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
            Xác nhận mật khẩu mới
          </label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">Mật khẩu không khớp</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 text-green-500 text-sm rounded-lg border border-green-500/20">
            Đổi mật khẩu thành công! ✓
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || !currentPassword || !newPassword || !confirmPassword}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
