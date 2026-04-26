import { Request, Response } from "express";
import { z } from "zod";
import { CreateTaskUseCase } from "../../../../../core/tasks/usecases/create.usecase";

const schema = z.object({
  title: z.string().min(1).max(200),
  groupId: z.uuid(),
  createdAt: z.iso.datetime().optional(),
});

export class CreateTaskController {
  constructor(private usecase: CreateTaskUseCase) {}

  handle(req: Request, res: Response) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }
    try {
      const task = this.usecase.execute({
        title: result.data.title,
        groupId: result.data.groupId,
        createdAt: result.data.createdAt ? new Date(result.data.createdAt) : undefined,
      });
      res.status(201).json(task);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
