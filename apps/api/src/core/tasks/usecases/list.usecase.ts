import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";

export class ListTasksUseCase {
  constructor(private repository: TaskRepository) {}

  execute() {
    return this.repository.list();
  }
}
