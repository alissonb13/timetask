import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";

interface UpdateTaskInput {
  id: string;
  title: string;
  groupId: string;
}

export class UpdateTaskUseCase {
  constructor(private repository: TaskRepository) {}

  execute(input: UpdateTaskInput) {
    const task = this.repository.findById(input.id);
    if (!task) throw new Error("Task not found");
    task.update(input.title, input.groupId);
    this.repository.update(task);
    return task;
  }
}
