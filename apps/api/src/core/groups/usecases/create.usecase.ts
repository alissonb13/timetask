import { GroupRepository } from "../../../infrastructure/database/repositories/group.repository";
import { Group } from "../group";

interface CreateGroupInput {
  name: string;
}

export class CreateGroupUseCase {
  constructor(private repository: GroupRepository) {}

  execute(input: CreateGroupInput): Group {
    const group = Group.create(input.name);
    this.repository.create(group);
    return group;
  }
}
