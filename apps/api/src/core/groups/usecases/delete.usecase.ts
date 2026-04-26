import { GroupRepository } from "../../../infrastructure/database/repositories/group.repository";

export class DeleteGroupUseCase {
  constructor(private repository: GroupRepository) {}

  execute(id: string) {
    const group = this.repository.findById(id);
    if (!group) throw new Error("Group not found");
    group.delete();
    this.repository.update(group);
    return group;
  }
}
