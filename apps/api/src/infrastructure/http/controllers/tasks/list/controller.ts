import { Request, Response } from "express";
import { ListTasksUseCase } from "../../../../../core/tasks/usecases/list.usecase";

export class ListTasksController {
  constructor(private usecase: ListTasksUseCase) {}

  handle(_req: Request, res: Response) {
    try {
      const tasks = this.usecase.execute();
      res.status(200).json(tasks);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
