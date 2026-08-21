"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleRSVPAction(sessionId: string, status: 'going' | 'not_going') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Bạn phải đăng nhập để xác nhận tham gia" }
  }

  // Lấy RSVP hiện tại của user này (nếu có)
  const { data: existingRSVP } = await supabase
    .from('session_rsvps')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  let resultError;

  if (existingRSVP) {
    if (existingRSVP.status === status) {
      // Nếu ấn lại nút đã chọn -> Hủy bỏ RSVP (xóa khỏi danh sách)
      const { error } = await supabase
        .from('session_rsvps')
        .delete()
        .eq('id', existingRSVP.id)
      resultError = error
    } else {
      // Đổi trạng thái (Từ going -> not_going hoặc ngược lại)
      const { error } = await supabase
        .from('session_rsvps')
        .update({ status, responded_at: new Date().toISOString() })
        .eq('id', existingRSVP.id)
      resultError = error
    }
  } else {
    // Chưa có thì insert mới
    const { error } = await supabase
      .from('session_rsvps')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        status,
        responded_at: new Date().toISOString()
      })
    resultError = error
  }

  if (resultError) {
    console.error("RSVP Error:", resultError)
    return { error: "Không thể cập nhật trạng thái tham gia. Vui lòng thử lại." }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}

export async function getRSVPsForSession(sessionId: string) {
  const supabase = await createClient()
  
  // Lấy danh sách RSVP kèm theo thông tin User Profile (tên hiển thị)
  const { data, error } = await supabase
    .from('session_rsvps')
    .select(`
      *,
      profiles ( full_name )
    `)
    .eq('session_id', sessionId)
    .order('responded_at', { ascending: false })
    
  if (error) {
    console.error("Error fetching RSVPs:", error)
    return []
  }
  
  return data
}
