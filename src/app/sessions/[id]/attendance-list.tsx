"use client"

import { useState, useTransition, useOptimistic, useRef } from "react"
import { toggleAttendanceAction } from "@/app/actions/attendance"
import { addGuestAction, removeGuestAction } from "@/app/actions/guest"
import { Plus, Trash2, UserCircle2 } from "lucide-react"

export default function AttendanceList({ 
  sessionId, 
  rsvps, 
  attendances,
  guests,
  isCreator,
  currentUserId,
  isSettled
}: { 
  sessionId: string, 
  rsvps: any[], 
  attendances: any[],
  guests: any[],
  isCreator: boolean,
  currentUserId: string,
  isSettled?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  
  const [optimisticAttendances, addOptimisticAttendance] = useOptimistic(
    attendances,
    (state, { userId, attended }: { userId: string, attended: boolean }) => {
      const exists = state.some(a => a.user_id === userId)
      if (exists) {
        return state.map(a => a.user_id === userId ? { ...a, attended } : a)
      } else {
        return [...state, { user_id: userId, attended }]
      }
    }
  )

  const [optimisticGuests, updateOptimisticGuests] = useOptimistic(
    guests,
    (state, action: { type: 'add' | 'delete', payload: any }) => {
      if (action.type === 'add') {
        return [...state, { ...action.payload, id: `temp-${Date.now()}` }]
      }
      if (action.type === 'delete') {
        return state.filter(g => g.id !== action.payload)
      }
      return state
    }
  )
  
  const goingUsers = rsvps.filter((r) => r.status === 'going')

  const handleAddGuest = (formData: FormData) => {
    const name = formData.get("name") as string
    if (!name || !name.trim() || isSettled) return

    formRef.current?.reset()

    startTransition(async () => {
      updateOptimisticGuests({ type: 'add', payload: { session_id: sessionId, name } })
      await addGuestAction(sessionId, name)
    })
  }

  const handleRemoveGuest = (guestId: string) => {
    if (isSettled || !confirm("Bạn có chắc muốn xóa khách này khỏi danh sách?")) return
    
    startTransition(async () => {
      updateOptimisticGuests({ type: 'delete', payload: guestId })
      await removeGuestAction(guestId, sessionId)
    })
  }

  return (
    <div className="space-y-4">
      {/* Danh sách thành viên chính thức */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Thành viên ({goingUsers.length})</h4>
        {goingUsers.map(rsvp => {
          const hasAttended = optimisticAttendances.some(a => a.user_id === rsvp.user_id && a.attended)
          const canEdit = !isSettled && (isCreator || currentUserId === rsvp.user_id)
          
          return (
            <label key={rsvp.user_id} className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-200 ${canEdit ? 'cursor-pointer' : 'cursor-default'} ${hasAttended ? (isCreator ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-primary') : 'bg-card hover:bg-secondary'}`}>
              <span className={`font-medium ${hasAttended ? (isCreator ? 'text-amber-900' : 'text-green-800') : 'text-foreground'}`}>
                {rsvp.profiles?.full_name || 'Người dùng ẩn danh'}
                {currentUserId === rsvp.user_id && " (Bạn)"}
              </span>
              <input 
                type="checkbox" 
                className={`h-5 w-5 rounded border-border transition-colors ${isCreator ? 'text-amber-600 focus:ring-amber-500' : 'text-primary focus:ring-green-500'} disabled:opacity-50`}
                checked={hasAttended}
                disabled={!canEdit}
                onChange={(e) => {
                  const checked = e.target.checked
                  startTransition(async () => {
                    addOptimisticAttendance({ userId: rsvp.user_id, attended: checked })
                    await toggleAttendanceAction(sessionId, rsvp.user_id, checked)
                  })
                }}
              />
            </label>
          )
        })}
        
        {goingUsers.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground bg-secondary rounded-lg border border-dashed">
            Chưa có thành viên nào đăng ký
          </div>
        )}
      </div>

      {/* Danh sách khách vãng lai */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Khách vãng lai ({optimisticGuests.length})</h4>
        </div>
        
        {optimisticGuests.map(guest => (
          <div key={guest.id} className={`flex justify-between items-center p-3 rounded-lg border bg-amber-50 border-amber-200 transition-all duration-200 ${guest.id.toString().startsWith('temp') ? 'opacity-70' : ''}`}>
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-amber-700" />
              <span className="font-medium text-amber-900">{guest.name}</span>
            </div>
            
            {isCreator && !isSettled && (
              <button 
                type="button"
                onClick={() => handleRemoveGuest(guest.id)}
                className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                title="Xóa khách"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {isCreator && !isSettled && (
          <form ref={formRef} action={handleAddGuest} className="flex gap-2 mt-2">
            <input 
              type="text" 
              name="name" 
              placeholder="Nhập tên khách..." 
              required
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
