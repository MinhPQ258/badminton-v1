"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarDays, Clock, MapPin, Users, CheckCircle2, MoreVertical, Edit, Trash2, ChevronDown, ChevronUp, UserCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import AttendanceModal from "./attendance-modal"
import { toggleAttendanceAction } from "@/app/actions/attendance"

export default function SessionInfoCard({ 
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
  const [isOpen, setIsOpen] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">Sắp diễn ra</span>
      case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">Đã hoàn thành</span>
      case 'settled': return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">Đã quyết toán</span>
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const goingUsers = rsvps.filter((r) => r.status === 'going')
  
  // Check if current user is in RSVP list (can only check in if RSVPed, or maybe anyone can? Usually anyone)
  const hasAttended = attendances.some(a => a.user_id === currentUserId && a.attended)

  const handleQuickCheckIn = async () => {
    setIsPending(true)
    await toggleAttendanceAction(session.id, currentUserId, !hasAttended)
    setIsPending(false)
  }

  const openMenu = () => {
    dialogRef.current?.showModal()
  }

  const closeMenu = () => {
    dialogRef.current?.close()
  }

  return (
    <Card className="border-t-4 border-t-blue-500 overflow-hidden shadow-sm">
      <CardHeader className="pb-4 relative">
        <div className="flex justify-between items-start mb-2">
          {getStatusBadge(session.status)}
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-600 p-1">
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            
            {isCreator && (
              <>
                <button onClick={openMenu} className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <dialog 
                  ref={dialogRef}
                  className="p-0 bg-transparent backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm m-auto sm:m-auto mt-auto sm:mt-auto mb-0 sm:mb-auto rounded-t-2xl sm:rounded-xl w-full max-w-sm overflow-hidden"
                  onClick={(e) => {
                    if (e.target === dialogRef.current) closeMenu();
                  }}
                >
                  <div className="bg-white flex flex-col w-full animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
                    <div className="flex justify-between items-center p-4 border-b border-slate-100">
                      <h3 className="font-semibold text-lg text-slate-800">Tùy chọn</h3>
                      <button onClick={closeMenu} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3 space-y-1 pb-safe sm:pb-3">
                      <button className="w-full text-left px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors" onClick={() => { alert("Đang phát triển"); closeMenu(); }}>
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Edit className="h-5 w-5" /></div> Sửa thông tin
                      </button>
                      <button className="w-full text-left px-4 py-3.5 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors" onClick={() => { alert("Đang phát triển"); closeMenu(); }}>
                        <div className="bg-red-50 text-red-600 p-2 rounded-lg"><Trash2 className="h-5 w-5" /></div> Hủy buổi đánh
                      </button>
                    </div>
                  </div>
                </dialog>
              </>
            )}
          </div>
        </div>
        <CardTitle className="text-xl md:text-2xl mt-1">Buổi đánh cầu lông</CardTitle>
        <CardDescription className="text-sm md:text-base text-slate-600 flex items-center gap-2 mt-2">
          <CalendarDays className="h-4 w-4" /> {formatDate(session.start_time)}
        </CardDescription>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg"><Clock className="h-4 w-4 md:h-5 md:w-5 text-slate-600" /></div>
              <div>
                <p className="text-xs md:text-sm text-slate-500">Thời gian</p>
                <p className="text-sm md:text-base font-medium text-slate-900">{formatTime(session.start_time)} - {formatTime(session.end_time)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg"><MapPin className="h-4 w-4 md:h-5 md:w-5 text-slate-600" /></div>
              <div>
                <p className="text-xs md:text-sm text-slate-500">Địa điểm</p>
                <p className="text-sm md:text-base font-medium text-slate-900">{session.venue || 'Chưa cập nhật'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg"><CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-slate-600" /></div>
              <div>
                <p className="text-xs md:text-sm text-slate-500">Chi phí dự kiến</p>
                <p className="text-sm md:text-base font-medium text-slate-900">{session.cost_per_person ? `${session.cost_per_person.toLocaleString('vi-VN')} đ/người` : 'Chưa chốt'}</p>
              </div>
            </div>


          </div>
        </CardContent>
      )}
    </Card>
  )
}
