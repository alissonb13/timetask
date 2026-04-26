import { Request, Response } from "express";
import { z } from "zod";
import { RenameGroupUseCase } from "../../../../../core/groups/usecases/rename.usecase";

const schema = z.object({
  name: z.string().min(1).max(100),
});

export class UpdateGroupController {
  constructor(private usecase: RenameGroupUseCase) {}

  handle(req: Request, res: Response) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }
    try {
      const group = this.usecase.execute({ id: String(req.params.id), name: result.data.name });
      res.status(200).json(group);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message === "Group not found" ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }
}
