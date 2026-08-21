import { z } from "zod";

export const toggleRsvpSchema = z.object({
  sessionId: z.string().uuid("ID buổi đánh không hợp lệ").or(z.string()),
  status: z.enum(['going', 'not_going']),
});
