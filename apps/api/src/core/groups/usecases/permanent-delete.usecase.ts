import { GroupRepository } from "../../../infrastructure/database/repositories/group.repository";
import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";

interface PermanentDeleteGroupInput {
  id: string;
  migrateToGroupId?: string;
}

export class PermanentDeleteGroupUseCase {
  constructor(
    private groupRepository: GroupRepository,
    private taskRepository: TaskRepository,
  ) {}

  execute(input: PermanentDeleteGroupInput) {
    const group = this.groupRepository.findById(input.id);
    if (!group) throw new Error("Group not found");

    if (input.migrateToGroupId) {
      const target = this.groupRepository.findById(input.migrateToGroupId);
      if (!target) throw new Error("Target group not found");
      this.taskRepository.migrateGroup(input.id, input.migrateToGroupId);
    } else {
      this.taskRepository.deleteByGroupId(input.id);
    }

    this.groupRepository.delete(input.id);
  }
}
