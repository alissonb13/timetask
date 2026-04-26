import { Request, Response } from "express";
import { StartTaskUseCase } from "../../../../../core/tasks/usecases/start.usecase";

export class StartTaskController {
  constructor(private usecase: StartTaskUseCase) {}

  handle(req: Request, res: Response) {
    try {
      const task = this.usecase.execute(String(req.params.id));
      res.status(200).json(task);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message === "Task not found" ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }
}
