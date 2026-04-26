import { Request, Response } from "express";
import { DeleteTaskUseCase } from "../../../../../core/tasks/usecases/delete.usecase";

export class DeleteTaskController {
  constructor(private usecase: DeleteTaskUseCase) {}

  handle(req: Request, res: Response) {
    try {
      this.usecase.execute(String(req.params.id));
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message === "Task not found" ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }
}
