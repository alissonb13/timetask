import { Request, Response } from "express";
import { StopTaskUseCase } from "../../../../../core/tasks/usecases/stop.usecase";

export class StopTaskController {
  constructor(private usecase: StopTaskUseCase) {}

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
