"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Users, CheckCircle2, XCircle, HelpCircle } from "lucide-react"

interface ParticipantsModalProps {
  open: boolean
  onClose: () => void
  rsvpUsers: Array<{
    user_id: string
    status: string
    profiles?: { full_name: string } | null
  }>
  attendances?: Array<{
    user_id: string
    attended: boolean
    profiles?: { full_name: string } | null
  }>
  guests?: Array<{
    id: string
    name: string
  }>
  totalAttendees: number
  sessionDate: string
  showAttendanceTab?: boolean
}

export default function ParticipantsModal({ open, onClose, rsvpUsers, attendances = [], guests = [], totalAttendees, sessionDate }: ParticipantsModalProps) {
  const [tab, setTab] = useState<"rsvp" | "attendance">("rsvp")

  const goingUsers = rsvpUsers.filter(r => r.status === "going")
  const notGoingUsers = rsvpUsers.filter(r => r.status === "not_going")

  const dateStr = new Date(sessionDate).toLocaleDateString("vi-VN", {
    day: "numeric", month: "numeric", year: "numeric"
  })

  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  // Color from name hash
  const getColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
      "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
    ]
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <Modal open={open} onClose={onClose} title={`Buổi ${dateStr}`} size="sm">
      {/* Tab switcher */}
      {showAttendanceTab && (
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("rsvp")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              tab === "rsvp" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4" />
              Đăng ký ({goingUsers.length})
            </span>
            {tab === "rsvp" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setTab("attendance")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              tab === "attendance" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Điểm danh ({totalAttendees})
            </span>
            {tab === "attendance" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-1 max-h-[50vh] overflow-y-auto">
        {(!showAttendanceTab || tab === "rsvp") ? (
          <>
            {goingUsers.length > 0 && (
              <div className="space-y-1">
                {goingUsers.map((user) => {
                  const name = user.profiles?.full_name || "Không rõ"
                  return (
                    <div key={user.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors">
                      <div className={`w-8 h-8 rounded-full ${getColor(name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {getInitial(name)}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground truncate">{name}</span>
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tham gia
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {notGoingUsers.length > 0 && (
              <div className="space-y-1 mt-3">
                <p className="text-xs text-muted-foreground font-medium px-3 mb-1">Không tham gia</p>
                {notGoingUsers.map((user) => {
                  const name = user.profiles?.full_name || "Không rõ"
                  return (
                    <div key={user.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors opacity-60">
                      <div className={`w-8 h-8 rounded-full bg-muted-foreground/30 flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0`}>
                        {getInitial(name)}
                      </div>
                      <span className="flex-1 text-sm text-muted-foreground truncate">{name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5" /> Bận
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {rsvpUsers.length === 0 && (
              <div className="py-8 text-center">
                <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chưa có ai đăng ký</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1 mt-1">
            {attendances.length > 0 || guests.length > 0 ? (
              <>
                {attendances.map((att) => {
                  const name = att.profiles?.full_name || "Không rõ"
                  return (
                    <div key={att.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors">
                      <div className={`w-8 h-8 rounded-full ${getColor(name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {getInitial(name)}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground truncate">{name}</span>
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã điểm danh
                      </span>
                    </div>
                  )
                })}
                {guests.map((guest) => {
                  const name = guest.name
                  return (
                    <div key={guest.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors">
                      <div className={`w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {getInitial(name)}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground truncate">{name} (Khách)</span>
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã điểm danh
                      </span>
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chưa có ai điểm danh</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Xem chi tiết tại trang buổi đánh</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
