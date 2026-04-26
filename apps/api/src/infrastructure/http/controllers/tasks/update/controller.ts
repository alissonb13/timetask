import { Request, Response } from "express";
import { z } from "zod";
import { UpdateTaskUseCase } from "../../../../../core/tasks/usecases/update.usecase";

const schema = z.object({
  title: z.string().min(1).max(200),
  groupId: z.uuid(),
});

export class UpdateTaskController {
  constructor(private usecase: UpdateTaskUseCase) {}

  handle(req: Request, res: Response) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }
    try {
      const task = this.usecase.execute({ id: String(req.params.id), ...result.data });
      res.status(200).json(task);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message === "Task not found" ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }
}
