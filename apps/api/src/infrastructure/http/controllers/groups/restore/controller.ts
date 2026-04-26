import { Request, Response } from "express";
import { RestoreGroupUseCase } from "../../../../../core/groups/usecases/restore.usecase";

export class RestoreGroupController {
  constructor(private usecase: RestoreGroupUseCase) {}

  handle(req: Request, res: Response) {
    try {
      const group = this.usecase.execute(String(req.params.id));
      res.status(200).json(group);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      const status = message === "Group not found" ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }
}
