import { Task } from "../../../core/tasks/task";
import { TaskInterval } from "../../../core/tasks/task-interval";
import { TaskStatus } from "../../../core/tasks/task-status";
import { db } from "../sqlite";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  group_id: string;
  created_at: string;
  deleted_at: string | null;
};

type IntervalRow = {
  id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
};

function rowToTask(row: TaskRow, intervals: IntervalRow[]): Task {
  return new Task(
    row.id,
    row.title,
    row.status as TaskStatus,
    row.group_id,
    new Date(row.created_at),
    row.deleted_at ? new Date(row.deleted_at) : null,
    intervals
      .filter((i) => i.task_id === row.id)
      .map(
        (i) =>
          new TaskInterval(
            i.id,
            i.task_id,
            new Date(i.started_at),
            i.ended_at ? new Date(i.ended_at) : null,
          ),
      ),
  );
}

export class TaskRepository {
  create(task: Task) {
    db.prepare(
      `INSERT INTO tasks (id, title, status, group_id, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      task.id,
      task.title,
      task.status,
      task.groupId,
      task.createdAt.toISOString(),
      task.deletedAt?.toISOString() ?? null,
    );
  }

  findById(id: string): Task | null {
    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
    if (!row) return null;
    const intervals = db
      .prepare("SELECT * FROM task_intervals WHERE task_id = ? ORDER BY started_at ASC")
      .all(id) as IntervalRow[];
    return rowToTask(row, intervals);
  }

  list(): Task[] {
    const rows = db
      .prepare("SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY created_at DESC")
      .all() as TaskRow[];
    if (rows.length === 0) return [];
    const taskIds = rows.map((r) => r.id);
    const placeholders = taskIds.map(() => "?").join(",");
    const intervals = db
      .prepare(
        `SELECT * FROM task_intervals WHERE task_id IN (${placeholders}) ORDER BY started_at ASC`,
      )
      .all(...taskIds) as IntervalRow[];
    return rows.map((row) => rowToTask(row, intervals));
  }

  update(task: Task) {
    db.prepare(
      `UPDATE tasks SET title = ?, status = ?, group_id = ?, deleted_at = ? WHERE id = ?`,
    ).run(
      task.title,
      task.status,
      task.groupId,
      task.deletedAt?.toISOString() ?? null,
      task.id,
    );
  }

  updateStatus(id: string, status: TaskStatus) {
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, id);
  }

  delete(id: string) {
    // task_intervals cascades via FK ON DELETE CASCADE
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  }

  deleteByGroupId(groupId: string) {
    db.prepare("DELETE FROM tasks WHERE group_id = ?").run(groupId);
  }

  migrateGroup(fromGroupId: string, toGroupId: string) {
    db.prepare("UPDATE tasks SET group_id = ? WHERE group_id = ?").run(toGroupId, fromGroupId);
  }

  addInterval(interval: TaskInterval) {
    db.prepare(
      `INSERT INTO task_intervals (id, task_id, started_at, ended_at) VALUES (?, ?, ?, ?)`,
    ).run(
      interval.id,
      interval.taskId,
      interval.startedAt.toISOString(),
      interval.endedAt?.toISOString() ?? null,
    );
  }

  closeLastInterval(taskId: string, endedAt: Date) {
    db.prepare(`
      UPDATE task_intervals
      SET ended_at = ?
      WHERE id = (
        SELECT id FROM task_intervals
        WHERE task_id = ? AND ended_at IS NULL
        ORDER BY started_at DESC
        LIMIT 1
      )
    `).run(endedAt.toISOString(), taskId);
  }
}
