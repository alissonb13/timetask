import { createContext, useContext, useEffect, useState } from "react";
import { api, type ApiGroup } from "@/lib/api";
import { groupRegistry } from "@/lib/group-registry";

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  deletedAt: Date | null;
}

function apiGroupToGroup(g: ApiGroup): Group {
  return {
    id: g.id,
    name: g.name,
    createdAt: new Date(g.createdAt),
    deletedAt: g.deletedAt ? new Date(g.deletedAt) : null,
  };
}

interface GroupContextValue {
  groups: Group[];
  addGroup: (name: string) => void;
  renameGroup: (id: string, newName: string) => void;
  deleteGroup: (id: string) => void;
  restoreGroup: (id: string) => void;
  permanentlyDeleteGroup: (id: string, migrateToGroupId?: string) => void;
  migrateGroupTasks: (fromId: string, toId: string) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);

  // Keep registry in sync so task context can map groupId → name
  useEffect(() => {
    groupRegistry.update(groups);
  }, [groups]);

  useEffect(() => {
    api.groups.list().then((data) => setGroups(data.map(apiGroupToGroup)));
  }, []);

  function addGroup(name: string) {
    const normalized = name.trim();
    if (
      groups.some(
        (g) =>
          g.name.toLowerCase() === normalized.toLowerCase() && !g.deletedAt,
      )
    )
      return;
    api.groups
      .create({ name: normalized })
      .then((data) => setGroups((prev) => [apiGroupToGroup(data), ...prev]));
  }

  function renameGroup(id: string, newName: string) {
    const normalized = newName.trim();
    if (
      groups.some(
        (g) =>
          g.id !== id &&
          g.name.toLowerCase() === normalized.toLowerCase() &&
          !g.deletedAt,
      )
    )
      return;
    api.groups
      .rename(id, { name: normalized })
      .then((data) =>
        setGroups((prev) =>
          prev.map((g) => (g.id === id ? apiGroupToGroup(data) : g)),
        ),
      );
  }

  function deleteGroup(id: string) {
    api.groups
      .softDelete(id)
      .then((data) =>
        setGroups((prev) =>
          prev.map((g) => (g.id === id ? apiGroupToGroup(data) : g)),
        ),
      );
  }

  function restoreGroup(id: string) {
    api.groups
      .restore(id)
      .then((data) =>
        setGroups((prev) =>
          prev.map((g) => (g.id === id ? apiGroupToGroup(data) : g)),
        ),
      );
  }

  function permanentlyDeleteGroup(id: string, migrateToGroupId?: string) {
    api.groups
      .permanentDelete(id, migrateToGroupId ? { migrateToGroupId } : undefined)
      .then(() => setGroups((prev) => prev.filter((g) => g.id !== id)));
  }

  function migrateGroupTasks(fromId: string, toId: string) {
    api.groups.migrateTasks(fromId, { toId });
  }

  return (
    <GroupContext
      value={{
        groups,
        addGroup,
        renameGroup,
        deleteGroup,
        restoreGroup,
        permanentlyDeleteGroup,
        migrateGroupTasks,
      }}
    >
      {children}
    </GroupContext>
  );
}

export function useGroupContext(): GroupContextValue {
  const ctx = useContext(GroupContext);
  if (!ctx)
    throw new Error("useGroupContext must be used inside GroupProvider");
  return ctx;
}
