"use server"

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  
  if (!username || !password) {
    return { error: "Vui lòng nhập đầy đủ thông tin" }
  }

  const email = `${username.toLowerCase()}@badminton.local`
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

export async function signupAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  
  if (!username || !password || !fullName) {
    return { error: "Vui lòng nhập đầy đủ thông tin" }
  }

  const email = `${username.toLowerCase()}@badminton.local`
  
  // Sử dụng Admin API để tạo user và tự động confirm email
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    }
  })

  if (createError) {
    return { error: createError.message }
  }
  
  // Đăng nhập ngay sau khi tạo thành công
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: signInError.message }
  }

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
