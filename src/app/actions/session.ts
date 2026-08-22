"use server"

import { actionWrapper } from "@/lib/utils/action-wrapper";
import { createSessionSchema } from "@/modules/session/session.schema";
import * as sessionService from "@/modules/session/session.service";
import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/utils/error";
import { revalidatePath } from "next/cache";

// Những hàm GET thường được gọi trực tiếp trên Server Components 
// nên ta vẫn trả về raw data thay vì bọc actionWrapper (để tránh break UI cũ)
export async function getUpcomingSessions() {
  return await sessionService.getUpcomingSessions();
}

export async function getRecentSessions() {
  return await sessionService.getRecentSessions();
}

export async function getSessionById(id: string) {
  return await sessionService.getSessionById(id);
}

// Server Action mutate data -> Áp dụng Action Wrapper và Validation
export async function createSessionAction(formData: FormData) {
  return actionWrapper(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new AppError("Bạn phải đăng nhập để tạo buổi đánh", 401);
    }

    const input = {
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      location: formData.get("location") as string,
    };
    
    const parsedInput = createSessionSchema.parse(input);
    
    return await sessionService.createSession(parsedInput, user.id);
  });
}

export async function deleteSessionAction(sessionId: string) {
  return actionWrapper(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppError("Bạn phải đăng nhập", 401);

    await sessionService.deleteSession(sessionId, user.id);
    revalidatePath("/");
  });
}

export async function updateSessionAction(sessionId: string, data: { start_time?: string, end_time?: string, venue?: string }) {
  return actionWrapper(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppError("Bạn phải đăng nhập", 401);

    await sessionService.updateSession(sessionId, data, user.id);
    revalidatePath("/");
    revalidatePath(`/sessions/${sessionId}`);
  });
}

