import { Router } from "express";
import { GroupRepository } from "../../database/repositories/group.repository";
import { TaskRepository } from "../../database/repositories/task.repository";
import { CreateGroupUseCase } from "../../../core/groups/usecases/create.usecase";
import { ListGroupsUseCase } from "../../../core/groups/usecases/list.usecase";
import { RenameGroupUseCase } from "../../../core/groups/usecases/rename.usecase";
import { DeleteGroupUseCase } from "../../../core/groups/usecases/delete.usecase";
import { RestoreGroupUseCase } from "../../../core/groups/usecases/restore.usecase";
import { PermanentDeleteGroupUseCase } from "../../../core/groups/usecases/permanent-delete.usecase";
import { MigrateGroupTasksUseCase } from "../../../core/groups/usecases/migrate-tasks.usecase";
import { CreateGroupController } from "../controllers/groups/create/controller";
import { ListGroupsController } from "../controllers/groups/list/controller";
import { UpdateGroupController } from "../controllers/groups/update/controller";
import { DeleteGroupController } from "../controllers/groups/delete/controller";
import { RestoreGroupController } from "../controllers/groups/restore/controller";
import { PermanentDeleteGroupController } from "../controllers/groups/permanent-delete/controller";
import { MigrateGroupTasksController } from "../controllers/groups/migrate-tasks/controller";

const groupsRouter = Router();
const groupRepository = new GroupRepository();
const taskRepository = new TaskRepository();

groupsRouter.get("/", (req, res) => {
  new ListGroupsController(new ListGroupsUseCase(groupRepository)).handle(req, res);
});

groupsRouter.post("/", (req, res) => {
  new CreateGroupController(new CreateGroupUseCase(groupRepository)).handle(req, res);
});

groupsRouter.put("/:id", (req, res) => {
  new UpdateGroupController(new RenameGroupUseCase(groupRepository)).handle(req, res);
});

groupsRouter.delete("/:id", (req, res) => {
  new DeleteGroupController(new DeleteGroupUseCase(groupRepository)).handle(req, res);
});

groupsRouter.post("/:id/restore", (req, res) => {
  new RestoreGroupController(new RestoreGroupUseCase(groupRepository)).handle(req, res);
});

groupsRouter.post("/:id/migrate-tasks", (req, res) => {
  new MigrateGroupTasksController(
    new MigrateGroupTasksUseCase(groupRepository, taskRepository),
  ).handle(req, res);
});

groupsRouter.delete("/:id/permanent", (req, res) => {
  new PermanentDeleteGroupController(
    new PermanentDeleteGroupUseCase(groupRepository, taskRepository),
  ).handle(req, res);
});

export { groupsRouter };
