import { GroupRepository } from "../../../infrastructure/database/repositories/group.repository";
import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";

interface MigrateGroupTasksInput {
  fromId: string;
  toId: string;
}

export class MigrateGroupTasksUseCase {
  constructor(
    private groupRepository: GroupRepository,
    private taskRepository: TaskRepository,
  ) {}

  execute(input: MigrateGroupTasksInput) {
    const from = this.groupRepository.findById(input.fromId);
    if (!from) throw new Error("Source group not found");
    const to = this.groupRepository.findById(input.toId);
    if (!to) throw new Error("Target group not found");
    this.taskRepository.migrateGroup(input.fromId, input.toId);
  }
}
