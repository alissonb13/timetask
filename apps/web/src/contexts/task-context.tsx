import { createContext, useContext, useEffect, useState } from "react";
import { api, type ApiTask } from "@/lib/api";
import { groupRegistry } from "@/lib/group-registry";

export const TaskStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskStatusLabel: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  PAUSED: "Paused",
  COMPLETED: "Completed",
};

export interface TaskInterval {
  startedAt: Date;
  endedAt: Date | null;
}

export interface Task {
  id: string;
  title: string;
  group: string;
  status: TaskStatus;
  createdAt: Date;
  intervals: TaskInterval[];
}

export function calculateDuration(intervals: TaskInterval[]): number {
  return intervals.reduce((total, interval) => {
    const end = interval.endedAt ?? new Date();
    return (
      total + Math.floor((end.getTime() - interval.startedAt.getTime()) / 1000)
    );
  }, 0);
}

function apiTaskToTask(t: ApiTask): Task {
  const group = groupRegistry.findById(t.groupId);
  return {
    id: t.id,
    title: t.title,
    group: group?.name ?? "",
    status: t.status as TaskStatus,
    createdAt: new Date(t.createdAt),
    intervals: (t.intervals ?? []).map((i) => ({
      startedAt: new Date(i.startedAt),
      endedAt: i.endedAt ? new Date(i.endedAt) : null,
    })),
  };
}

interface TaskContextValue {
  tasks: Task[];
  addTask: (title: string, group: string, date?: Date) => void;
  updateTask: (
    id: string,
    updates: Partial<Pick<Task, "title" | "group">>,
  ) => void;
  deleteTask: (id: string) => void;
  startTask: (id: string) => void;
  pauseTask: (id: string) => void;
  continueTask: (id: string) => void;
  stopTask: (id: string) => void;
  reloadTasks: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  function loadTasks() {
    api.tasks.list().then((data) => setTasks(data.map(apiTaskToTask)));
  }

  useEffect(() => {
    // Delay initial load slightly so GroupProvider can populate the registry first
    const id = setTimeout(loadTasks, 50);
    return () => clearTimeout(id);
  }, []);

  function addTask(title: string, group: string, date?: Date) {
    const entry = groupRegistry.findByName(group);
    if (!entry) return;
    api.tasks
      .create({ title, groupId: entry.id, createdAt: date?.toISOString() })
      .then((data) => setTasks((prev) => [apiTaskToTask(data), ...prev]));
  }

  function updateTask(
    id: string,
    updates: Partial<Pick<Task, "title" | "group">>,
  ) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newTitle = updates.title ?? task.title;
    const newGroupName = updates.group ?? task.group;
    const entry = groupRegistry.findByName(newGroupName);
    if (!entry) return;
    api.tasks
      .update(id, { title: newTitle, groupId: entry.id })
      .then((data) =>
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? apiTaskToTask(data) : t)),
        ),
      );
  }

  function deleteTask(id: string) {
    api.tasks
      .delete(id)
      .then(() => setTasks((prev) => prev.filter((t) => t.id !== id)));
  }

  function startTask(id: string) {
    api.tasks
      .start(id)
      .then((data) =>
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? apiTaskToTask(data) : t)),
        ),
      );
  }

  function pauseTask(id: string) {
    api.tasks
      .pause(id)
      .then((data) =>
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? apiTaskToTask(data) : t)),
        ),
      );
  }

  function continueTask(id: string) {
    api.tasks
      .continue(id)
      .then((data) =>
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? apiTaskToTask(data) : t)),
        ),
      );
  }

  function stopTask(id: string) {
    api.tasks
      .stop(id)
      .then((data) =>
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? apiTaskToTask(data) : t)),
        ),
      );
  }

  function reloadTasks() {
    loadTasks();
  }

  return (
    <TaskContext
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        startTask,
        pauseTask,
        continueTask,
        stopTask,
        reloadTasks,
      }}
    >
      {children}
    </TaskContext>
  );
}

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used inside TaskProvider");
  return ctx;
}
