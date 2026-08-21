import { AppError } from "@/lib/utils/error";
import * as attendanceModel from "./attendance.model";
import { getSessionById } from "@/modules/session/session.service";

export async function toggleAttendance(sessionId: string, userId: string, attended: boolean, currentUserId: string) {
  if (currentUserId !== userId) {
    const session = await getSessionById(sessionId);
    if (!session || session.created_by !== currentUserId) {
      throw new AppError("Bạn không có quyền điểm danh hộ người khác", 403);
    }
  }

  try {
    const existing = await attendanceModel.getExistingAttendance(sessionId, userId);
    if (existing) {
      await attendanceModel.updateAttendance(existing.id, attended, currentUserId);
    } else {
      await attendanceModel.insertAttendance(sessionId, userId, attended, currentUserId);
    }
  } catch (error) {
    throw new AppError("Không thể điểm danh. Vui lòng thử lại.", 500);
  }
}

export async function getAttendancesForSession(sessionId: string) {
  try {
    return await attendanceModel.getAttendancesForSession(sessionId);
  } catch (error) {
    return [];
  }
}
