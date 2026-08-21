"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleAttendanceAction(sessionId: string, userId: string, attended: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Bạn phải đăng nhập" }
  }

  // Security check: user can only check themselves unless they are the creator
  if (user.id !== userId) {
    const { data: session } = await supabase.from('sessions').select('created_by').eq('id', sessionId).single()
    if (!session || session.created_by !== user.id) {
      return { error: "Bạn không có quyền điểm danh hộ người khác" }
    }
  }

  const { data: existingAttendance } = await supabase
    .from('session_attendances')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single()

  let resultError;

  if (existingAttendance) {
    const { error } = await supabase
      .from('session_attendances')
      .update({ 
        attended, 
        marked_by: user.id, 
        marked_at: new Date().toISOString() 
      })
      .eq('id', existingAttendance.id)
    resultError = error
  } else {
    const { error } = await supabase
      .from('session_attendances')
      .insert({
        session_id: sessionId,
        user_id: userId,
        attended,
        marked_by: user.id,
        marked_at: new Date().toISOString()
      })
    resultError = error
  }

  if (resultError) {
    console.error("Attendance Error:", resultError)
    return { error: "Không thể điểm danh. Vui lòng thử lại." }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}

export async function getAttendancesForSession(sessionId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('session_attendances')
    .select('*')
    .eq('session_id', sessionId)
    
  if (error) {
    console.error("Error fetching attendances:", error)
    return []
  }
  
  return data
}
