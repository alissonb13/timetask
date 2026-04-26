import { Group } from "../../../core/groups/group";
import { db } from "../sqlite";

type GroupRow = {
  id: string;
  name: string;
  created_at: string;
  deleted_at: string | null;
};

function rowToGroup(row: GroupRow): Group {
  return new Group(
    row.id,
    row.name,
    new Date(row.created_at),
    row.deleted_at ? new Date(row.deleted_at) : null,
  );
}

export class GroupRepository {
  findById(id: string): Group | null {
    const row = db.prepare("SELECT * FROM groups WHERE id = ?").get(id) as GroupRow | undefined;
    return row ? rowToGroup(row) : null;
  }

  list(): Group[] {
    const rows = db
      .prepare("SELECT * FROM groups ORDER BY created_at DESC")
      .all() as GroupRow[];
    return rows.map(rowToGroup);
  }

  create(group: Group) {
    db.prepare(
      `INSERT INTO groups (id, name, created_at, deleted_at) VALUES (?, ?, ?, ?)`,
    ).run(
      group.id,
      group.name,
      group.createdAt.toISOString(),
      group.deletedAt?.toISOString() ?? null,
    );
  }

  update(group: Group) {
    db.prepare(`UPDATE groups SET name = ?, deleted_at = ? WHERE id = ?`).run(
      group.name,
      group.deletedAt?.toISOString() ?? null,
      group.id,
    );
  }

  delete(id: string) {
    db.prepare("DELETE FROM groups WHERE id = ?").run(id);
  }
}
