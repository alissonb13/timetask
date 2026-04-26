import { Request, Response } from "express";
import { z } from "zod";
import { CreateGroupUseCase } from "../../../../../core/groups/usecases/create.usecase";

const schema = z.object({
  name: z.string().min(1).max(100),
});

export class CreateGroupController {
  constructor(private usecase: CreateGroupUseCase) {}

  handle(req: Request, res: Response) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }
    try {
      const group = this.usecase.execute(result.data);
      res.status(201).json(group);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
