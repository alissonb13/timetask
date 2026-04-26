import { Router } from "express";
import { TaskRepository } from "../../database/repositories/task.repository";
import { CreateTaskUseCase } from "../../../core/tasks/usecases/create.usecase";
import { ListTasksUseCase } from "../../../core/tasks/usecases/list.usecase";
import { UpdateTaskUseCase } from "../../../core/tasks/usecases/update.usecase";
import { DeleteTaskUseCase } from "../../../core/tasks/usecases/delete.usecase";
import { StartTaskUseCase } from "../../../core/tasks/usecases/start.usecase";
import { PauseTaskUseCase } from "../../../core/tasks/usecases/pause.usecase";
import { ContinueTaskUseCase } from "../../../core/tasks/usecases/continue.usecase";
import { StopTaskUseCase } from "../../../core/tasks/usecases/stop.usecase";
import { CreateTaskController } from "../controllers/tasks/create/controller";
import { ListTasksController } from "../controllers/tasks/list/controller";
import { UpdateTaskController } from "../controllers/tasks/update/controller";
import { DeleteTaskController } from "../controllers/tasks/delete/controller";
import { StartTaskController } from "../controllers/tasks/start/controller";
import { PauseTaskController } from "../controllers/tasks/pause/controller";
import { ContinueTaskController } from "../controllers/tasks/continue/controller";
import { StopTaskController } from "../controllers/tasks/stop/controller";

const tasksRouter = Router();
const repository = new TaskRepository();

tasksRouter.get("/", (req, res) => {
  new ListTasksController(new ListTasksUseCase(repository)).handle(req, res);
});

tasksRouter.post("/", (req, res) => {
  new CreateTaskController(new CreateTaskUseCase(repository)).handle(req, res);
});

tasksRouter.put("/:id", (req, res) => {
  new UpdateTaskController(new UpdateTaskUseCase(repository)).handle(req, res);
});

tasksRouter.delete("/:id", (req, res) => {
  new DeleteTaskController(new DeleteTaskUseCase(repository)).handle(req, res);
});

tasksRouter.post("/:id/start", (req, res) => {
  new StartTaskController(new StartTaskUseCase(repository)).handle(req, res);
});

tasksRouter.post("/:id/pause", (req, res) => {
  new PauseTaskController(new PauseTaskUseCase(repository)).handle(req, res);
});

tasksRouter.post("/:id/continue", (req, res) => {
  new ContinueTaskController(new ContinueTaskUseCase(repository)).handle(req, res);
});

tasksRouter.post("/:id/stop", (req, res) => {
  new StopTaskController(new StopTaskUseCase(repository)).handle(req, res);
});

export { tasksRouter };
