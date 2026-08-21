import { AppError } from "@/lib/utils/error";
import * as rsvpModel from "./rsvp.model";

export async function toggleRSVP(sessionId: string, userId: string, status: 'going' | 'not_going') {
  try {
    const existing = await rsvpModel.getExistingRSVP(sessionId, userId);
    
    if (existing) {
      if (existing.status === status) {
        await rsvpModel.deleteRSVP(existing.id);
      } else {
        await rsvpModel.updateRSVP(existing.id, status);
      }
    } else {
      await rsvpModel.insertRSVP(sessionId, userId, status);
    }
  } catch (error) {
    throw new AppError("Không thể cập nhật trạng thái tham gia. Vui lòng thử lại.", 500);
  }
}

export async function getRSVPsForSession(sessionId: string) {
  try {
    return await rsvpModel.getRSVPsForSession(sessionId);
  } catch (error) {
    return [];
  }
}
