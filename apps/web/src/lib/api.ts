const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3000";

export interface ApiTaskInterval {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt: string | null;
}

export interface ApiTask {
  id: string;
  title: string;
  status: string;
  groupId: string;
  createdAt: string;
  deletedAt: string | null;
  intervals: ApiTaskInterval[];
}

export interface ApiGroup {
  id: string;
  name: string;
  createdAt: string;
  deletedAt: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  tasks: {
    list: () => request<ApiTask[]>("/tasks"),
    create: (data: { title: string; groupId: string; createdAt?: string }) =>
      request<ApiTask>("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { title: string; groupId: string }) =>
      request<ApiTask>(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
    start: (id: string) =>
      request<ApiTask>(`/tasks/${id}/start`, { method: "POST" }),
    pause: (id: string) =>
      request<ApiTask>(`/tasks/${id}/pause`, { method: "POST" }),
    continue: (id: string) =>
      request<ApiTask>(`/tasks/${id}/continue`, { method: "POST" }),
    stop: (id: string) =>
      request<ApiTask>(`/tasks/${id}/stop`, { method: "POST" }),
  },
  groups: {
    list: () => request<ApiGroup[]>("/groups"),
    create: (data: { name: string }) =>
      request<ApiGroup>("/groups", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    rename: (id: string, data: { name: string }) =>
      request<ApiGroup>(`/groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    softDelete: (id: string) =>
      request<ApiGroup>(`/groups/${id}`, { method: "DELETE" }),
    restore: (id: string) =>
      request<ApiGroup>(`/groups/${id}/restore`, { method: "POST" }),
    migrateTasks: (id: string, data: { toId: string }) =>
      request<void>(`/groups/${id}/migrate-tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    permanentDelete: (id: string, data?: { migrateToGroupId?: string }) =>
      request<void>(`/groups/${id}/permanent`, {
        method: "DELETE",
        body: JSON.stringify(data ?? {}),
      }),
  },
};
