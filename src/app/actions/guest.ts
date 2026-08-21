"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addGuestAction(sessionId: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Bạn phải đăng nhập" }
  }

  // Security check: only creator can add guest
  const { data: session } = await supabase.from('sessions').select('created_by, status').eq('id', sessionId).single()
  if (!session || session.created_by !== user.id) {
    return { error: "Chỉ quản trị viên mới được phép thêm khách" }
  }

  if (session.status === 'settled') {
    return { error: "Buổi đánh đã chốt sổ, không thể thêm khách" }
  }

  const { error } = await supabase
    .from('session_guests')
    .insert({
      session_id: sessionId,
      name: name,
      added_by: user.id
    })

  if (error) {
    console.error("Add Guest Error:", error)
    return { error: "Không thể thêm khách. Vui lòng thử lại." }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}

export async function removeGuestAction(guestId: string, sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Bạn phải đăng nhập" }
  }

  const { data: session } = await supabase.from('sessions').select('created_by, status').eq('id', sessionId).single()
  if (!session || session.created_by !== user.id) {
    return { error: "Chỉ quản trị viên mới được phép xóa khách" }
  }

  if (session.status === 'settled') {
    return { error: "Buổi đánh đã chốt sổ, không thể xóa khách" }
  }

  const { error } = await supabase
    .from('session_guests')
    .delete()
    .eq('id', guestId)

  if (error) {
    console.error("Remove Guest Error:", error)
    return { error: "Không thể xóa khách." }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}

export async function getGuestsForSession(sessionId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('session_guests')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    
  if (error) {
    console.error("Error fetching guests:", error)
    return []
  }
  
  return data
}
