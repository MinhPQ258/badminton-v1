import { AppError } from "@/lib/utils/error";
import * as guestModel from "./guest.model";
import { getSessionById } from "@/modules/session/session.service";

export async function addGuest(sessionId: string, name: string, userId: string) {
  const session = await getSessionById(sessionId);
  if (!session || session.created_by !== userId) {
    throw new AppError("Chỉ quản trị viên mới được phép thêm khách", 403);
  }
  if (session.status === 'settled') {
    throw new AppError("Buổi đánh đã chốt sổ, không thể thêm khách", 400);
  }

  try {
    await guestModel.insertGuest(sessionId, name, userId);
  } catch (error) {
    throw new AppError("Không thể thêm khách. Vui lòng thử lại.", 500);
  }
}

export async function removeGuest(guestId: string, sessionId: string, userId: string) {
  const session = await getSessionById(sessionId);
  if (!session || session.created_by !== userId) {
    throw new AppError("Chỉ quản trị viên mới được phép xóa khách", 403);
  }
  if (session.status === 'settled') {
    throw new AppError("Buổi đánh đã chốt sổ, không thể xóa khách", 400);
  }

  try {
    await guestModel.deleteGuest(guestId);
  } catch (error) {
    throw new AppError("Không thể xóa khách.", 500);
  }
}

export async function getGuestsForSession(sessionId: string) {
  try {
    return await guestModel.getGuestsForSession(sessionId);
  } catch (error) {
    return [];
  }
}
