import { z } from "zod";

export const addExpenseSchema = z.object({
  sessionId: z.string().uuid("ID buổi đánh không hợp lệ").or(z.string()), // or z.string in case it's not a UUID
  label: z.string().min(1, "Vui lòng nhập tên khoản chi"),
  amount: z.number().min(0, "Số tiền không hợp lệ"),
});
