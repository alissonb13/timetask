import { TaskInterval } from "./task-interval";
import { TaskStatus } from "./task-status";

export class Task {
  constructor(
    public id: string,
    public title: string,
    public status: TaskStatus,
    public groupId: string,
    public createdAt: Date,
    public deletedAt: Date | null = null,
    public intervals: TaskInterval[] = [],
  ) {}

  static create(title: string, groupId: string, createdAt?: Date): Task {
    return new Task(crypto.randomUUID(), title, TaskStatus.PENDING, groupId, createdAt ?? new Date());
  }

  update(title: string, groupId: string) {
    this.title = title;
    this.groupId = groupId;
  }

  delete() {
    this.deletedAt = new Date();
  }

  start() {
    this.status = TaskStatus.IN_PROGRESS;
    this.intervals.push(TaskInterval.create(this.id));
  }

  pause() {
    this.status = TaskStatus.PAUSED;
    const last = this.intervals.at(-1);
    if (last && last.endedAt === null) last.end();
  }

  continue() {
    this.status = TaskStatus.IN_PROGRESS;
    this.intervals.push(TaskInterval.create(this.id));
  }

  stop() {
    this.status = TaskStatus.COMPLETED;
    const last = this.intervals.at(-1);
    if (last && last.endedAt === null) last.end();
  }
}
