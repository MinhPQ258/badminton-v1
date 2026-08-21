"use client"

import { useState } from "react"
import { Users, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import AttendanceList from "./attendance-list"

export default function AttendanceModal({ 
  session, 
  rsvps, 
  attendances, 
  isCreator, 
  currentUserId 
}: { 
  session: any, 
  rsvps: any[], 
  attendances: any[], 
  isCreator: boolean, 
  currentUserId: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'rsvp' | 'attendance'>('attendance')

  const goingUsers = rsvps.filter((r) => r.status === 'going')
  const totalRsvp = goingUsers.length
  const totalAttended = session.total_attendees || 0

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-3 p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between transition-colors group text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 font-semibold text-xs z-20">
              <Users className="h-4 w-4" />
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600 font-semibold text-xs z-10">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Chi tiết thành viên</p>
            <p className="text-xs text-slate-500">{totalRsvp} Đăng ký • {totalAttended} Đã điểm danh</p>
          </div>
        </div>
        <span className="text-xs font-medium text-blue-600 group-hover:underline">Xem danh sách</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-lg text-slate-800">Danh sách thành viên</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 shrink-0">
              <button 
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('attendance')}
              >
                Điểm danh ({totalAttended})
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rsvp' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
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
                    isCreator={isCreator}
                    currentUserId={currentUserId}
                  />
                </div>
              )}

              {activeTab === 'rsvp' && (
                <div className="space-y-2">
                  {goingUsers.length > 0 ? (
                    goingUsers.map((rsvp: any) => (
                      <div key={rsvp.user_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-800">
                          {rsvp.profiles?.full_name || 'Ẩn danh'}
                          {currentUserId === rsvp.user_id && " (Bạn)"}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Đã đăng ký</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">Chưa có ai đăng ký tham gia</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <Button onClick={() => setIsOpen(false)} className="w-full" variant="outline">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
