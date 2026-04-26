import { Request, Response } from "express";
import { z } from "zod";
import { PermanentDeleteGroupUseCase } from "../../../../../core/groups/usecases/permanent-delete.usecase";

const schema = z.object({
  migrateToGroupId: z.uuid().optional(),
});

export class PermanentDeleteGroupController {
  constructor(private usecase: PermanentDeleteGroupUseCase) {}

  handle(req: Request, res: Response) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }
    try {
      this.usecase.execute({ id: String(req.params.id), ...result.data });
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message.includes("not found") ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }
}
