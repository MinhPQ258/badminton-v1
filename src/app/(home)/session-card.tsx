"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, CheckCircle2, Pencil, Trash2 } from "lucide-react"
import { ActionSheet, ActionSheetItem } from "@/components/ui/action-sheet"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { deleteSessionAction } from "@/app/actions/session"
import ParticipantsModal from "./participants-modal"

interface SessionCardProps {
  session: {
    id: string
    start_time: string
    end_time: string
    venue: string | null
    status: string
    created_by: string
    total_attendees: number | null
  }
  goingCount: number
  myStatus: string | null
  currentUserId: string
  rsvpUsers: Array<{ user_id: string; status: string; profiles?: { full_name: string } | null }>
  attendances?: Array<{ user_id: string; attended: boolean; profiles?: { full_name: string } | null }>
  guests?: Array<{ id: string; name: string }>
  variant?: "upcoming" | "recent"
}

export default function SessionCard({ session, goingCount, myStatus, currentUserId, rsvpUsers, attendances = [], guests = [], variant = "upcoming" }: SessionCardProps) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Long-press detection
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPress = useRef(false)
  const touchMoved = useRef(false)

  const isCreator = currentUserId === session.created_by
  const isEnded = new Date() > new Date(session.end_time)
  const showAttendanceTab = isCreator || isEnded

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getMyStatusBadge = (status: string | null) => {
    if (status === 'going') return <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium border border-primary">Bạn: Tham gia</span>
    if (status === 'not_going') return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200">Bạn: Bận</span>
    return <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded text-xs border border-border">Chưa xác nhận</span>
  }

  // Touch handlers for long-press
  const handleTouchStart = useCallback(() => {
    touchMoved.current = false
    isLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true
      if (isCreator) {
        setShowActions(true)
      }
    }, 500)
  }, [isCreator])

  const handleTouchMove = useCallback(() => {
    touchMoved.current = true
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // Context menu (right-click) for desktop
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isCreator) {
      e.preventDefault()
      setShowActions(true)
    }
  }, [isCreator])

  // Handle card click — skip if long-pressed
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
  }, [])

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteSessionAction(session.id)
    if (result.success) {
      setShowDeleteConfirm(false)
      router.refresh()
    } else {
      alert(result.error || "Lỗi khi xóa")
    }
    setDeleting(false)
  }

  // Handle participants click
  const handleParticipantsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowParticipants(true)
  }

  // Action sheet items
  const actionItems: ActionSheetItem[] = [
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="w-5 h-5" />,
      onClick: () => router.push(`/sessions/${session.id}`),
    },
    {
      label: "Xóa buổi đánh",
      icon: <Trash2 className="w-5 h-5" />,
      onClick: () => setShowDeleteConfirm(true),
      variant: "destructive",
    },
  ]

  if (variant === "recent") {
    return (
      <>
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={handleContextMenu}
          className="block"
        >
          <Link href={`/sessions/${session.id}`} className="block p-4 hover:bg-secondary transition-colors group" onClick={handleCardClick}>
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {new Date(session.start_time).toLocaleDateString('vi-VN')}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                {session.status === 'settled' ? 'Đã quyết toán' : 'Hoàn thành'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground flex justify-between items-center mt-2">
              <div className="flex items-center gap-3">
                <button onClick={handleParticipantsClick} className="flex items-center gap-1 hover:text-primary transition-colors" title="Xem danh sách">
                  <Users className="w-3 h-3 text-muted-foreground" /> {goingCount}
                </button>
                {showAttendanceTab && (
                  <button onClick={handleParticipantsClick} className="flex items-center gap-1 hover:text-primary transition-colors" title="Xem danh sách">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> {session.total_attendees || 0}
                  </button>
                )}
              </div>
            </div>
          </Link>
        </div>

        <ActionSheet open={showActions} onClose={() => setShowActions(false)} items={actionItems} title={`Buổi ${new Date(session.start_time).toLocaleDateString('vi-VN')}`} />
        <ConfirmDialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title="Xóa buổi đánh" description="Bạn có chắc muốn xóa buổi đánh này? Thao tác này không thể hoàn tác." confirmText="Xóa" loading={deleting} />
        <ParticipantsModal open={showParticipants} onClose={() => setShowParticipants(false)} rsvpUsers={rsvpUsers} attendances={attendances} guests={guests} totalAttendees={session.total_attendees || 0} sessionDate={session.start_time} showAttendanceTab={showAttendanceTab} />
      </>
    )
  }

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        className="block"
      >
        <Link href={`/sessions/${session.id}`} className="block group" onClick={handleCardClick}>
          <Card className="h-full hover:shadow-md transition-all hover:border-primary">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardDescription><span className="font-medium text-primary">Sắp diễn ra</span></CardDescription>
                {getMyStatusBadge(myStatus)}
              </div>
              <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{formatDate(session.start_time)}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 text-sm text-muted-foreground space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{session.venue || 'Chưa cập nhật địa điểm'}</span>
              </div>
              <div className="flex items-center justify-between bg-secondary p-2 rounded-md">
                <button onClick={handleParticipantsClick} className="flex items-center gap-1 hover:text-primary transition-colors" title="Xem danh sách đăng ký">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{goingCount} <span className="font-normal text-muted-foreground text-xs">đăng ký</span></span>
                </button>
                {showAttendanceTab && (
                  <>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <button onClick={handleParticipantsClick} className="flex items-center gap-1 hover:text-primary transition-colors" title="Xem danh sách điểm danh">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{session.total_attendees || 0} <span className="font-normal text-muted-foreground text-xs">điểm danh</span></span>
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <ActionSheet open={showActions} onClose={() => setShowActions(false)} items={actionItems} title={`Buổi ${formatDate(session.start_time)}`} />
      <ConfirmDialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title="Xóa buổi đánh" description="Bạn có chắc muốn xóa buổi đánh này? Thao tác này không thể hoàn tác." confirmText="Xóa" loading={deleting} />
      <ParticipantsModal open={showParticipants} onClose={() => setShowParticipants(false)} rsvpUsers={rsvpUsers} attendances={attendances} guests={guests} totalAttendees={session.total_attendees || 0} sessionDate={session.start_time} showAttendanceTab={showAttendanceTab} />
    </>
  )
}
