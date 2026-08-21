"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addExpenseAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: "Bạn phải đăng nhập" }

  const sessionId = formData.get("session_id") as string
  const label = formData.get("label") as string
  const amountStr = formData.get("amount") as string
  
  // Loại bỏ các ký tự không phải số (ví dụ: dấu phẩy, chữ đ)
  const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10)

  if (!sessionId || !label || isNaN(amount)) {
    return { error: "Vui lòng nhập tên khoản chi và số tiền hợp lệ" }
  }

  // Phân quyền: Chỉ người tạo buổi đánh mới được thêm chi phí
  const { data: session } = await supabase.from('sessions').select('created_by, status').eq('id', sessionId).single()
  
  if (!session || session.created_by !== user.id) {
    return { error: "Chỉ người tạo buổi đánh mới được thêm chi phí" }
  }
  if (session.status === 'settled') {
    return { error: "Buổi đánh đã chốt sổ, không thể thêm chi phí" }
  }

  const { error } = await supabase
    .from('session_expenses')
    .insert({
      session_id: sessionId,
      label,
      amount,
      created_by: user.id
    })

  if (error) {
    console.error("Expense Error:", error)
    return { error: "Lỗi hệ thống khi thêm chi phí" }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}

export async function deleteExpenseAction(expenseId: string, sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Bạn phải đăng nhập" }

  const { data: session } = await supabase.from('sessions').select('created_by, status').eq('id', sessionId).single()
  if (!session || session.created_by !== user.id) {
    return { error: "Chỉ người tạo buổi đánh mới được xóa chi phí" }
  }
  if (session.status === 'settled') {
    return { error: "Buổi đánh đã chốt sổ" }
  }

  const { error } = await supabase.from('session_expenses').delete().eq('id', expenseId)

  if (error) {
    return { error: "Lỗi khi xóa chi phí" }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}

export async function getExpensesForSession(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('session_expenses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    
  if (error) {
    console.error("Error fetching expenses:", error)
    return []
  }
  return data
}

export async function settleSessionAction(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Bạn phải đăng nhập" }

  const { data: session } = await supabase.from('sessions').select('created_by, status').eq('id', sessionId).single()
  if (!session || session.created_by !== user.id) return { error: "Chỉ người tạo buổi đánh mới được chốt sổ" }
  if (session.status === 'settled') return { error: "Buổi đánh đã chốt sổ rồi" }

  const { error } = await supabase.from('sessions').update({ 
    status: 'settled',
    settled_at: new Date().toISOString(),
    settled_by: user.id
  }).eq('id', sessionId)

  if (error) {
    console.error("Settle Error:", error)
    return { error: "Lỗi khi chốt sổ" }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}
