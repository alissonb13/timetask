import { TaskStatus } from "../task-status";
import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";

export class StopTaskUseCase {
  constructor(private repository: TaskRepository) {}

  execute(id: string) {
    const task = this.repository.findById(id);
    if (!task) throw new Error("Task not found");
    const now = new Date();
    this.repository.updateStatus(id, TaskStatus.COMPLETED);
    this.repository.closeLastInterval(id, now);
    return this.repository.findById(id);
  }
}
