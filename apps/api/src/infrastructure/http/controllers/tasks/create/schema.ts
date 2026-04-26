import { z } from "zod";

export const createTaskSchema = {
  title: z.string().min(3).max(100),
  groupId: z.uuid(),
};
