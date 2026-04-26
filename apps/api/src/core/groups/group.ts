export class Group {
  constructor(
    public id: string,
    public name: string,
    public createdAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  static create(name: string): Group {
    return new Group(crypto.randomUUID(), name, new Date());
  }

  rename(name: string) {
    this.name = name;
  }

  delete() {
    this.deletedAt = new Date();
  }

  restore() {
    this.deletedAt = null;
  }
}
