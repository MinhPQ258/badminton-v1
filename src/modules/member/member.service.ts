import { AppError } from "@/lib/utils/error";
import * as memberModel from "./member.model";

export interface MemberInfo {
  id: string
  fullName: string
  username: string
  email: string
  role: string
  createdAt: string
}

export async function getAllMembers(): Promise<MemberInfo[]> {
  try {
    const [users, profiles] = await Promise.all([
      memberModel.listAllUsers(),
      memberModel.getProfiles(),
    ]);

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return users.map(user => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        fullName: user.user_metadata?.full_name || profile?.full_name || "Chưa cập nhật",
        username: (user.email || "").split("@")[0],
        email: user.email || "",
        role: profile?.role || "member",
        createdAt: user.created_at,
      };
    });
  } catch (error: any) {
    throw new AppError("Lỗi khi lấy danh sách thành viên: " + error.message, 500);
  }
}

export async function updateMember(userId: string, fullName: string, requesterId: string, requesterRole: string) {
  // Chỉ admin hoặc chính user đó mới được sửa
  if (requesterRole !== 'admin' && requesterId !== userId) {
    throw new AppError("Bạn không có quyền sửa thông tin người khác", 403);
  }

  try {
    await memberModel.updateUserProfile(userId, fullName);
  } catch (error: any) {
    throw new AppError("Lỗi khi cập nhật thành viên: " + error.message, 500);
  }
}

export async function resetMemberPassword(userId: string, requesterRole: string) {
  if (requesterRole !== 'admin') {
    throw new AppError("Chỉ admin mới có quyền reset mật khẩu", 403);
  }

  try {
    await memberModel.resetUserPassword(userId, "123456");
  } catch (error: any) {
    throw new AppError("Lỗi khi reset mật khẩu: " + error.message, 500);
  }
}

export async function deleteMember(userId: string, requesterId: string, requesterRole: string) {
  if (requesterRole !== 'admin') {
    throw new AppError("Chỉ admin mới có quyền xóa thành viên", 403);
  }
  if (userId === requesterId) {
    throw new AppError("Bạn không thể xóa chính mình", 400);
  }

  try {
    await memberModel.deleteUser(userId);
  } catch (error: any) {
    throw new AppError("Lỗi khi xóa thành viên: " + error.message, 500);
  }
}
