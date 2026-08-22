"use server"

import { createClient } from "@/lib/supabase/server"
import { actionWrapper } from "@/lib/utils/action-wrapper"
import { AppError } from "@/lib/utils/error"
import * as memberService from "@/modules/member/member.service"
import { revalidatePath } from "next/cache"

async function getCurrentUserWithRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AppError("Bạn phải đăng nhập", 401)

  // Lấy role từ bảng profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    role: profile?.role || 'member',
  }
}

export async function getMembersAction() {
  return actionWrapper(async () => {
    return await memberService.getAllMembers()
  })
}

export async function updateMemberAction(userId: string, fullName: string) {
  return actionWrapper(async () => {
    const requester = await getCurrentUserWithRole()
    await memberService.updateMember(userId, fullName, requester.id, requester.role)
    revalidatePath("/members")
  })
}

export async function resetPasswordAction(userId: string) {
  return actionWrapper(async () => {
    const requester = await getCurrentUserWithRole()
    await memberService.resetMemberPassword(userId, requester.role)
    revalidatePath("/members")
  })
}

export async function deleteMemberAction(userId: string) {
  return actionWrapper(async () => {
    const requester = await getCurrentUserWithRole()
    await memberService.deleteMember(userId, requester.id, requester.role)
    revalidatePath("/members")
  })
}
