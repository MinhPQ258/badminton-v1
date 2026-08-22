"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Users, CheckCircle2, UserCheck, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleAttendanceAction } from "@/app/actions/attendance"
import AttendanceList from "./attendance-list"

export default function MemberActions({ 
  session, 
  rsvps, 
  attendances,
  guests,
  isCreator, 
  currentUserId 
}: { 
  session: any, 
  rsvps: any[], 
  attendances: any[],
  guests: any[],
  isCreator: boolean, 
  currentUserId: string 
}) {
  const [activeTab, setActiveTab] = useState<'rsvp' | 'attendance'>('attendance')
  const [isPending, setIsPending] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const goingUsers = rsvps.filter((r) => r.status === 'going')
  const totalRsvp = goingUsers.length
  
  // Tính tổng số người đã điểm danh (member chính thức + khách)
  const attendedMembersCount = attendances.filter(a => a.attended).length
  const totalAttended = attendedMembersCount + guests.length
  
  const hasAttended = attendances.some(a => a.user_id === currentUserId && a.attended)
  const isSettled = session.status === 'settled'

  const handleQuickCheckIn = async () => {
    setIsPending(true)
    await toggleAttendanceAction(session.id, currentUserId, !hasAttended)
    setIsPending(false)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mt-6">
        <button 
          onClick={openModal}
          className="w-full p-4 flex items-center justify-between hover:bg-secondary transition-colors group text-left border-b border-border"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="h-9 w-9 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-primary font-semibold text-xs z-20">
                <Users className="h-4 w-4" />
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-primary font-semibold text-xs z-10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Chi tiết thành viên</p>
              <p className="text-sm text-muted-foreground">{totalRsvp} Đăng ký • {totalAttended} Đã điểm danh</p>
            </div>
          </div>
          <span className="text-sm font-medium text-primary group-hover:underline pr-1">Xem danh sách</span>
        </button>

        {!isSettled && (
          <div className="p-4 bg-secondary/50">
            <Button 
              onClick={handleQuickCheckIn} 
              disabled={isPending}
              variant={hasAttended ? "secondary" : "default"}
              className={`w-full h-11 text-sm font-medium transition-all ${hasAttended ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-primary hover:bg-primary/90 shadow-sm"}`}
            >
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
              {hasAttended ? "Đã điểm danh thành công" : "Điểm danh ngay"}
            </Button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-4 border-b border-border shrink-0">
              <h3 className="font-semibold text-lg text-foreground">Danh sách thành viên</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-muted-foreground bg-secondary hover:bg-secondary p-1 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex border-b border-border shrink-0">
              <button 
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-blue-600 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('attendance')}
              >
                Điểm danh ({totalAttended})
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rsvp' ? 'border-blue-600 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('rsvp')}
              >
                Đăng ký tham gia ({totalRsvp})
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">
                      {isCreator ? "Quản trị viên: Có thể điểm danh cho tất cả" : "Thành viên: Chỉ có thể tự điểm danh cho chính mình"}
                    </p>
                  </div>
                  <AttendanceList 
                    sessionId={session.id} 
                    rsvps={rsvps} 
                    attendances={attendances}
                    guests={guests}
                    isCreator={isCreator}
                    currentUserId={currentUserId}
                    isSettled={isSettled}
                    onClose={closeModal}
                  />
                </div>
              )}

              {activeTab === 'rsvp' && (
                <div className="space-y-2">
                  {goingUsers.length > 0 ? (
                    goingUsers.map((rsvp: any) => (
                      <div key={rsvp.user_id} className="flex justify-between items-center p-3 bg-secondary rounded-lg border border-border">
                        <span className="font-medium text-foreground">
                          {rsvp.profiles?.full_name || 'Ẩn danh'}
                          {currentUserId === rsvp.user_id && " (Bạn)"}
                        </span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">Đã đăng ký</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có ai đăng ký tham gia</p>
                  )}
                </div>
              )}
            </div>
            
            {activeTab === 'rsvp' && (
              <div className="p-4 border-t border-border bg-secondary shrink-0">
                <Button onClick={closeModal} className="w-full" variant="outline">
                  Đóng
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
