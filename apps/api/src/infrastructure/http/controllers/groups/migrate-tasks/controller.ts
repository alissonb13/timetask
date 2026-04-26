import { Request, Response } from "express";
import { z } from "zod";
import { MigrateGroupTasksUseCase } from "../../../../../core/groups/usecases/migrate-tasks.usecase";

const schema = z.object({
  toId: z.uuid(),
});

export class MigrateGroupTasksController {
  constructor(private usecase: MigrateGroupTasksUseCase) {}

  handle(req: Request, res: Response) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }
    try {
      this.usecase.execute({ fromId: String(req.params.id), toId: result.data.toId });
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message.includes("not found") ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }
}
