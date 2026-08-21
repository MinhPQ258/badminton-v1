import { AppError } from "@/lib/utils/error";
import * as expenseModel from "./expense.model";
import { getSessionById } from "@/modules/session/session.service";

export async function addExpense(sessionId: string, label: string, amount: number, userId: string) {
  const session = await getSessionById(sessionId);
  if (!session || session.created_by !== userId) {
    throw new AppError("Chỉ người tạo buổi đánh mới được thêm chi phí", 403);
  }
  if (session.status === 'settled') {
    throw new AppError("Buổi đánh đã chốt sổ, không thể thêm chi phí", 400);
  }

  try {
    await expenseModel.insertExpense(sessionId, label, amount, userId);
  } catch (error) {
    throw new AppError("Lỗi hệ thống khi thêm chi phí", 500);
  }
}

export async function deleteExpense(expenseId: string, sessionId: string, userId: string) {
  const session = await getSessionById(sessionId);
  if (!session || session.created_by !== userId) {
    throw new AppError("Chỉ người tạo buổi đánh mới được xóa chi phí", 403);
  }
  if (session.status === 'settled') {
    throw new AppError("Buổi đánh đã chốt sổ", 400);
  }

  try {
    await expenseModel.deleteExpense(expenseId);
  } catch (error) {
    throw new AppError("Lỗi khi xóa chi phí", 500);
  }
}

export async function getExpensesForSession(sessionId: string) {
  try {
    return await expenseModel.getExpensesForSession(sessionId);
  } catch (error) {
    return [];
  }
}

export async function settleSession(sessionId: string, userId: string) {
  const session = await getSessionById(sessionId);
  if (!session || session.created_by !== userId) {
    throw new AppError("Chỉ người tạo buổi đánh mới được chốt sổ", 403);
  }
  if (session.status === 'settled') {
    throw new AppError("Buổi đánh đã chốt sổ rồi", 400);
  }

  try {
    await expenseModel.updateSessionStatus(sessionId, 'settled', userId);
  } catch (error) {
    throw new AppError("Lỗi khi chốt sổ", 500);
  }
}
