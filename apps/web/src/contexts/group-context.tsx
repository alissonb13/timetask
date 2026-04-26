import { createContext, useContext, useEffect, useState } from "react";
import { useTaskContext } from "./task-context";

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  deletedAt: Date | null;
}

const STORAGE_KEY_GROUPS = "timetask:groups";

function deserializeGroups(json: string): Group[] {
  const parsed = JSON.parse(json) as (Group | string)[];
  return parsed.map((g) => {
    if (typeof g === "string") {
      return { id: crypto.randomUUID(), name: g, createdAt: new Date(), deletedAt: null };
    }
    return {
      ...g,
      createdAt: new Date(g.createdAt),
      deletedAt: g.deletedAt ? new Date(g.deletedAt) : null,
    };
  });
}

function loadGroups(): Group[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
    return raw ? deserializeGroups(raw) : [];
  } catch {
    return [];
  }
}

interface GroupContextValue {
  groups: Group[];
  addGroup: (name: string) => void;
  renameGroup: (id: string, newName: string) => void;
  deleteGroup: (id: string) => void;
  restoreGroup: (id: string) => void;
  permanentlyDeleteGroup: (id: string) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(loadGroups);
  const { updateTasksGroupName, deleteTasksByGroup } = useTaskContext();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
  }, [groups]);

  function addGroup(name: string) {
    const normalized = name.trim();
    if (
      groups.some(
        (g) =>
          g.name.toLowerCase() === normalized.toLowerCase() && !g.deletedAt,
      )
    )
      return;
    const group: Group = {
      id: crypto.randomUUID(),
      name: normalized,
      createdAt: new Date(),
      deletedAt: null,
    };
    setGroups((prev) => [group, ...prev]);
  }

  function renameGroup(id: string, newName: string) {
    const normalized = newName.trim();
    const current = groups.find((g) => g.id === id);
    if (!current) return;
    if (
      groups.some(
        (g) =>
          g.id !== id &&
          g.name.toLowerCase() === normalized.toLowerCase() &&
          !g.deletedAt,
      )
    )
      return;
    updateTasksGroupName(current.name, normalized);
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: normalized } : g)),
    );
  }

  function deleteGroup(id: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, deletedAt: new Date() } : g)),
    );
  }

  function restoreGroup(id: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, deletedAt: null } : g)),
    );
  }

  function permanentlyDeleteGroup(id: string) {
    const group = groups.find((g) => g.id === id);
    if (!group) return;
    deleteTasksByGroup(group.name);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <GroupContext
      value={{ groups, addGroup, renameGroup, deleteGroup, restoreGroup, permanentlyDeleteGroup }}
    >
      {children}
    </GroupContext>
  );
}

export function useGroupContext(): GroupContextValue {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroupContext must be used inside GroupProvider");
  return ctx;
}
