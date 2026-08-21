"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { actionWrapper } from "@/lib/utils/action-wrapper"
import { addGuestSchema } from "@/modules/guest/guest.schema"
import * as guestService from "@/modules/guest/guest.service"
import { AppError } from "@/lib/utils/error"

export async function addGuestAction(sessionId: string, name: string) {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Bạn phải đăng nhập", 401)

    const input = { sessionId, name }
    const parsed = addGuestSchema.parse(input)

    await guestService.addGuest(parsed.sessionId, parsed.name, user.id)
    revalidatePath(`/sessions/${sessionId}`)
  })
}

export async function removeGuestAction(guestId: string, sessionId: string) {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Bạn phải đăng nhập", 401)

    await guestService.removeGuest(guestId, sessionId, user.id)
    revalidatePath(`/sessions/${sessionId}`)
  })
}

export async function getGuestsForSession(sessionId: string) {
  return await guestService.getGuestsForSession(sessionId)
}
