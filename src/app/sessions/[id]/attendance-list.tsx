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
  isSettled,
  onClose
}: { 
  sessionId: string, 
  rsvps: any[], 
  attendances: any[],
  guests: any[],
  isCreator: boolean,
  currentUserId: string,
  isSettled?: boolean
  onClose?: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  
  // Local state for checkboxes
  const initialAttendances = attendances.reduce((acc, a) => {
    if (a.attended) acc[a.user_id] = true
    return acc
  }, {} as Record<string, boolean>)
  
  const [localAttendances, setLocalAttendances] = useState<Record<string, boolean>>(initialAttendances)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [optimisticAttendances, addOptimisticAttendance] = useOptimistic(
    attendances,
    (state, action: { type: 'batch', payload: Record<string, boolean> }) => {
      let newState = [...state]
      Object.entries(action.payload).forEach(([userId, attended]) => {
        const exists = newState.some(a => a.user_id === userId)
        if (exists) {
          newState = newState.map(a => a.user_id === userId ? { ...a, attended } : a)
        } else {
          newState = [...newState, { user_id: userId, attended }]
        }
      })
      return newState
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

  const handleSave = () => {
    if (!hasChanges) {
      onClose?.()
      return
    }
    
    startTransition(async () => {
      addOptimisticAttendance({ type: 'batch', payload: localAttendances })
      
      // Find what changed
      const promises = []
      for (const [userId, attended] of Object.entries(localAttendances)) {
        const original = initialAttendances[userId] || false
        if (original !== attended) {
          promises.push(toggleAttendanceAction(sessionId, userId, attended))
        }
      }
      
      await Promise.all(promises)
      setHasChanges(false)
      onClose?.()
    })
  }

  return (
    <div className="space-y-4">
      {/* Danh sách thành viên chính thức */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Thành viên ({goingUsers.length})</h4>
        {goingUsers.map(rsvp => {
          const hasAttended = localAttendances[rsvp.user_id] || false
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
                checked={localAttendances[rsvp.user_id] || false}
                disabled={!canEdit || isPending}
                onChange={(e) => {
                  const checked = e.target.checked
                  setLocalAttendances(prev => ({ ...prev, [rsvp.user_id]: checked }))
                  setHasChanges(true)
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
      
      {/* Nút Lưu */}
      <div className="-mx-4 -mb-4 mt-4 p-4 border-t border-border bg-secondary flex justify-end gap-2">
        <button 
          onClick={onClose}
          type="button" 
          className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-card transition-colors bg-card"
        >
          Hủy
        </button>
        <button 
          onClick={handleSave}
          disabled={isPending}
          type="button" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
        >
          {isPending ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  )
}
