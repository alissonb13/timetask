import { Request, Response } from "express";
import { ListGroupsUseCase } from "../../../../../core/groups/usecases/list.usecase";

export class ListGroupsController {
  constructor(private usecase: ListGroupsUseCase) {}

  handle(_req: Request, res: Response) {
    try {
      const groups = this.usecase.execute();
      res.status(200).json(groups);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
