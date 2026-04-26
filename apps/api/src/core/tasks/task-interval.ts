export class TaskInterval {
  constructor(
    public id: string,
    public taskId: string,
    public startedAt: Date,
    public endedAt: Date | null = null,
  ) {}

  static create(taskId: string): TaskInterval {
    return new TaskInterval(crypto.randomUUID(), taskId, new Date());
  }

  end() {
    this.endedAt = new Date();
  }
}
