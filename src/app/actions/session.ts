"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUpcomingSessions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'upcoming')
    .order('start_time', { ascending: true })
    
  if (error) {
    console.error("Error fetching sessions:", error)
    return []
  }
  
  return data
}

export async function getRecentSessions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .in('status', ['completed', 'settled'])
    .order('start_time', { ascending: false })
    .limit(5)
    
  if (error) {
    console.error("Error fetching recent sessions:", error)
    return []
  }
  
  return data
}

export async function createSessionAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Bạn phải đăng nhập để tạo buổi đánh" }
  }

  const startTime = formData.get("start_time") as string
  const endTime = formData.get("end_time") as string
  // const location = formData.get("location") as string // Bỏ qua location vì CSDL chưa có cột này
  
  if (!startTime || !endTime) {
    return { error: "Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc" }
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      status: 'upcoming',
      created_by: user.id,
      venue: formData.get("location") as string || "Chưa xác định",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, id: data.id }
}

export async function getSessionById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    return null
  }
  
  return data
}

