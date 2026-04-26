import { GroupRepository } from "../../../infrastructure/database/repositories/group.repository";

export class RestoreGroupUseCase {
  constructor(private repository: GroupRepository) {}

  execute(id: string) {
    const group = this.repository.findById(id);
    if (!group) throw new Error("Group not found");
    group.restore();
    this.repository.update(group);
    return group;
  }
}
