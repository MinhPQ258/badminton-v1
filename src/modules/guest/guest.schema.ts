import { z } from "zod";

export const addGuestSchema = z.object({
  sessionId: z.string().uuid("ID buổi đánh không hợp lệ").or(z.string()),
  name: z.string().min(1, "Vui lòng nhập tên khách"),
});
