import { AppError } from "@/lib/utils/error";
import { CreateSessionInput } from "./session.schema";
import * as sessionModel from "./session.model";

export async function getUpcomingSessions() {
  try {
    return await sessionModel.findUpcomingSessions();
  } catch (error: any) {
    throw new AppError("Lỗi khi lấy danh sách buổi đánh sắp tới", 500);
  }
}

export async function getRecentSessions() {
  try {
    return await sessionModel.findRecentSessions();
  } catch (error: any) {
    throw new AppError("Lỗi khi lấy danh sách buổi đánh gần đây", 500);
  }
}

export async function getSessionById(id: string) {
  const session = await sessionModel.findSessionById(id);
  if (!session) {
    return null; // Some UI might expect null
  }
  return session;
}

export async function createSession(input: CreateSessionInput, userId: string) {
  try {
    const sessionData = {
      start_time: new Date(input.start_time).toISOString(),
      end_time: new Date(input.end_time).toISOString(),
      status: 'upcoming',
      created_by: userId,
      venue: input.location || "Chưa xác định",
    };
    
    const session = await sessionModel.createSession(sessionData);
    return { id: session.id };
  } catch (error: any) {
    throw new AppError("Lỗi khi tạo buổi đánh mới: " + error.message, 500);
  }
}
