import { GroupRepository } from "../../../infrastructure/database/repositories/group.repository";

export class ListGroupsUseCase {
  constructor(private repository: GroupRepository) {}

  execute() {
    return this.repository.list();
  }
}
