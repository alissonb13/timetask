import { TaskRepository } from "../../../infrastructure/database/repositories/task.repository";
import { Task } from "../task";

interface CreateTaskInput {
  title: string;
  groupId: string;
  createdAt?: Date;
}

export class CreateTaskUseCase {
  constructor(private repository: TaskRepository) {}

  execute(input: CreateTaskInput): Task {
    const task = Task.create(input.title, input.groupId, input.createdAt);
    this.repository.create(task);
    return task;
  }
}
