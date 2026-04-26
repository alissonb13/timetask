import { TaskInterval } from "../task-interval";
import { TaskStatus } from "../task-status";
import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";

export class StartTaskUseCase {
  constructor(private repository: TaskRepository) {}

  execute(id: string) {
    const task = this.repository.findById(id);
    if (!task) throw new Error("Task not found");
    const interval = TaskInterval.create(id);
    this.repository.updateStatus(id, TaskStatus.IN_PROGRESS);
    this.repository.addInterval(interval);
    return this.repository.findById(id);
  }
}
