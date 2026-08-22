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

export async function getDebtSummary(fromDate?: string, toDate?: string) {
  try {
    const payments = await expenseModel.getDebtSummary(fromDate, toDate);
    
    // Aggregate by user_id
    const userMap = new Map<string, { totalDue: number; totalPaid: number; details: any[] }>();
    
    for (const payment of payments) {
      const existing = userMap.get(payment.user_id) || { totalDue: 0, totalPaid: 0, details: [] };
      existing.totalDue += payment.amount_due || 0;
      if (payment.payment_status === 'paid') {
        existing.totalPaid += payment.amount_due || 0;
      } else if (payment.payment_status === 'unpaid' && (payment.amount_due || 0) > 0) {
        const sessionData = Array.isArray(payment.sessions) ? payment.sessions[0] : payment.sessions;
        existing.details.push({
          sessionId: payment.session_id,
          amount: payment.amount_due,
          sessionDate: sessionData?.start_time
        })
      }
      userMap.set(payment.user_id, existing);
    }

    return Array.from(userMap.entries()).map(([userId, data]) => ({
      userId,
      totalDue: data.totalDue,
      totalPaid: data.totalPaid,
      debt: data.totalDue - data.totalPaid,
      details: data.details,
    }));
  } catch (error) {
    return [];
  }
}

export async function getSessionExpenseReport(fromDate?: string, toDate?: string) {
  try {
    const sessions = await expenseModel.getSessionExpenseReport(fromDate, toDate);
    const sessionIds = sessions.map(s => s.id);
    const allExpenses = await expenseModel.getExpenseDetailsForSessions(sessionIds);

    return sessions.map(session => ({
      ...session,
      expenses: allExpenses.filter(e => e.session_id === session.id),
    }));
  } catch (error) {
    return [];
  }
}

