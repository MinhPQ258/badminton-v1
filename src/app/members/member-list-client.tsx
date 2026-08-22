"use client"

import { useState } from "react"
import { MoreVertical, Pencil, KeyRound, Trash2, Search } from "lucide-react"
import { ActionSheet, ActionSheetItem } from "@/components/ui/action-sheet"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateMemberAction, resetPasswordAction, deleteMemberAction } from "@/app/actions/member"

interface Member {
  id: string
  fullName: string
  username: string
  email: string
  role: string
  createdAt: string
}

interface MemberListClientProps {
  members: Member[]
  currentUserRole: string
  currentUserId: string
}

export default function MemberListClient({ members, currentUserRole, currentUserId }: MemberListClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editName, setEditName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = currentUserRole === "admin"

  const filteredMembers = members.filter(m =>
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    })
  }

  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  const getColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
      "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
    ]
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const openActions = (member: Member) => {
    setSelectedMember(member)
    setShowActions(true)
  }

  const getActionItems = (): ActionSheetItem[] => {
    const items: ActionSheetItem[] = [
      {
        label: "Sửa thông tin",
        icon: <Pencil className="w-5 h-5" />,
        onClick: () => {
          setEditName(selectedMember?.fullName || "")
          setShowEditModal(true)
        },
      },
    ]

    // Chỉ admin mới thấy Reset mật khẩu + Xóa, và không thể tự thao tác lên chính mình
    if (isAdmin && selectedMember?.id !== currentUserId) {
      items.push(
        {
          label: "Reset mật khẩu",
          icon: <KeyRound className="w-5 h-5" />,
          onClick: () => setShowResetConfirm(true),
        },
        {
          label: "Xóa thành viên",
          icon: <Trash2 className="w-5 h-5" />,
          onClick: () => setShowDeleteConfirm(true),
          variant: "destructive",
        },
      )
    }

    return items
  }

  const handleEdit = async () => {
    if (!selectedMember || !editName.trim()) return
    setLoading(true)
    setError(null)
    const result = await updateMemberAction(selectedMember.id, editName.trim())
    if (!result.success) {
      setError(result.error || "Lỗi khi cập nhật")
    } else {
      setShowEditModal(false)
      window.location.reload()
    }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!selectedMember) return
    setLoading(true)
    const result = await resetPasswordAction(selectedMember.id)
    if (!result.success) {
      alert(result.error || "Lỗi khi reset mật khẩu")
    } else {
      setShowResetConfirm(false)
      alert("Đã reset mật khẩu về '123456'")
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!selectedMember) return
    setLoading(true)
    const result = await deleteMemberAction(selectedMember.id)
    if (!result.success) {
      alert(result.error || "Lỗi khi xóa")
    } else {
      setShowDeleteConfirm(false)
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <>
      {/* Search */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thành viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {filteredMembers.length} thành viên {searchQuery && `(tìm thấy từ ${members.length})`}
        </p>
      </div>

      {/* Member list */}
      <div className="divide-y divide-border">
        {filteredMembers.map((member) => (
          <div key={member.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full ${getColor(member.fullName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
              {getInitial(member.fullName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{member.fullName}</p>
                {member.role === "admin" && (
                  <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold shrink-0">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">@{member.username}</span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="text-xs text-muted-foreground/70">{formatDate(member.createdAt)}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => openActions(member)}
              className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0"
              title="Tùy chọn"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {searchQuery ? "Không tìm thấy thành viên nào" : "Chưa có thành viên nào"}
          </div>
        )}
      </div>

      {/* Action Sheet */}
      <ActionSheet
        open={showActions}
        onClose={() => setShowActions(false)}
        items={getActionItems()}
        title={selectedMember?.fullName}
      />

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Sửa thông tin" size="sm">
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="member-fullname">
              Họ và tên
            </label>
            <Input
              id="member-fullname"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nhập họ và tên"
            />
          </div>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)} disabled={loading}>
              Hủy
            </Button>
            <Button className="flex-1" onClick={handleEdit} disabled={loading || !editName.trim()}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Confirm */}
      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset mật khẩu"
        description={`Mật khẩu của "${selectedMember?.fullName}" sẽ được reset về '123456'. Bạn có chắc chắn?`}
        confirmText="Reset"
        variant="default"
        loading={loading}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Xóa thành viên"
        description={`Bạn có chắc chắn muốn xóa "${selectedMember?.fullName}" khỏi hệ thống? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="destructive"
        loading={loading}
      />
    </>
  )
}
