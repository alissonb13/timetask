import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";

export class DeleteTaskUseCase {
  constructor(private repository: TaskRepository) {}

  execute(id: string) {
    const task = this.repository.findById(id);
    if (!task) throw new Error("Task not found");
    this.repository.delete(id);
  }
}
