"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { actionWrapper } from "@/lib/utils/action-wrapper"
import * as attendanceService from "@/modules/attendance/attendance.service"
import { AppError } from "@/lib/utils/error"

export async function toggleAttendanceAction(sessionId: string, userId: string, attended: boolean) {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new AppError("Bạn phải đăng nhập", 401)
    }

    await attendanceService.toggleAttendance(sessionId, userId, attended, user.id)
    revalidatePath(`/sessions/${sessionId}`)
  })
}

export async function getAttendancesForSession(sessionId: string) {
  return await attendanceService.getAttendancesForSession(sessionId)
}
