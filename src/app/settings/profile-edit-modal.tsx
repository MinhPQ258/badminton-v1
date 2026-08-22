"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProfileAction } from "@/app/actions/auth"

interface ProfileEditModalProps {
  open: boolean
  onClose: () => void
  currentFullName: string
}

export default function ProfileEditModal({ open, onClose, currentFullName }: ProfileEditModalProps) {
  const [fullName, setFullName] = useState(currentFullName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfileAction(fullName)
    
    if (!result.success) {
      setError(result.error || "Đã xảy ra lỗi")
    } else {
      setSuccess(true)
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 800)
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Sửa thông tin" size="sm">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="edit-fullname">
            Họ và tên
          </label>
          <Input
            id="edit-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 text-green-500 text-sm rounded-lg border border-green-500/20">
            Cập nhật thành công! ✓
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || fullName.trim() === currentFullName}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
