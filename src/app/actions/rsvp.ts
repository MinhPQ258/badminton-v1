"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { actionWrapper } from "@/lib/utils/action-wrapper"
import { toggleRsvpSchema } from "@/modules/rsvp/rsvp.schema"
import * as rsvpService from "@/modules/rsvp/rsvp.service"
import { AppError } from "@/lib/utils/error"

export async function toggleRSVPAction(sessionId: string, status: 'going' | 'not_going') {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Bạn phải đăng nhập để xác nhận tham gia", 401)

    const parsed = toggleRsvpSchema.parse({ sessionId, status })
    await rsvpService.toggleRSVP(parsed.sessionId, user.id, parsed.status)
    revalidatePath(`/sessions/${sessionId}`)
  })
}

export async function getRSVPsForSession(sessionId: string) {
  return await rsvpService.getRSVPsForSession(sessionId)
}
