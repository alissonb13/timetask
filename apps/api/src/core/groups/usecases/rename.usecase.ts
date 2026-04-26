import { GroupRepository } from "../../../infrastructure/database/repositories/group.repository";

interface RenameGroupInput {
  id: string;
  name: string;
}

export class RenameGroupUseCase {
  constructor(private repository: GroupRepository) {}

  execute(input: RenameGroupInput) {
    const group = this.repository.findById(input.id);
    if (!group) throw new Error("Group not found");
    group.rename(input.name);
    this.repository.update(group);
    return group;
  }
}
