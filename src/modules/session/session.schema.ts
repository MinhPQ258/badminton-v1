import { z } from "zod";

export const createSessionSchema = z.object({
  start_time: z.string().min(1, "Vui lòng nhập thời gian bắt đầu"),
  end_time: z.string().min(1, "Vui lòng nhập thời gian kết thúc"),
  location: z.string().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
