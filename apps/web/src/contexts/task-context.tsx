import { createContext, useContext, useEffect, useState } from "react";

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
		return total + Math.floor((end.getTime() - interval.startedAt.getTime()) / 1000);
	}, 0);
}

const STORAGE_KEY_TASKS = "timetask:tasks";
const STORAGE_KEY_GROUPS = "timetask:groups";

function deserializeTasks(json: string): Task[] {
	return (JSON.parse(json) as Task[]).map((t) => ({
		...t,
		createdAt: new Date(t.createdAt),
		intervals: (t.intervals ?? []).map((i: TaskInterval) => ({
			startedAt: new Date(i.startedAt),
			endedAt: i.endedAt ? new Date(i.endedAt) : null,
		})),
	}));
}

function loadTasks(): Task[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_TASKS);
		return raw ? deserializeTasks(raw) : [];
	} catch {
		return [];
	}
}

function loadGroups(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

interface TaskContextValue {
	tasks: Task[];
	groups: string[];
	addTask: (title: string, group: string) => void;
	addGroup: (name: string) => void;
	updateTask: (id: string, updates: Partial<Pick<Task, "title" | "group">>) => void;
	deleteTask: (id: string) => void;
	startTask: (id: string) => void;
	pauseTask: (id: string) => void;
	continueTask: (id: string) => void;
	stopTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
	const [tasks, setTasks] = useState<Task[]>(loadTasks);
	const [groups, setGroups] = useState<string[]>(loadGroups);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
	}, [tasks]);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
	}, [groups]);

	function addTask(title: string, group: string) {
		const task: Task = {
			id: crypto.randomUUID(),
			title,
			group,
			status: TaskStatus.PENDING,
			createdAt: new Date(),
			intervals: [],
		};
		setTasks((prev) => [task, ...prev]);
	}

	function addGroup(name: string) {
		setGroups((prev) => [...prev, name]);
	}

	function updateTask(id: string, updates: Partial<Pick<Task, "title" | "group">>) {
		setTasks((prev) =>
			prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
		);
	}

	function deleteTask(id: string) {
		setTasks((prev) => prev.filter((t) => t.id !== id));
	}

	function startTask(id: string) {
		setTasks((prev) =>
			prev.map((t) =>
				t.id === id
					? {
							...t,
							status: TaskStatus.IN_PROGRESS,
							intervals: [...t.intervals, { startedAt: new Date(), endedAt: null }],
						}
					: t,
			),
		);
	}

	function pauseTask(id: string) {
		const now = new Date();
		setTasks((prev) =>
			prev.map((t) => {
				if (t.id !== id) return t;
				return {
					...t,
					status: TaskStatus.PAUSED,
					intervals: t.intervals.map((interval, i) =>
						i === t.intervals.length - 1 && interval.endedAt === null
							? { ...interval, endedAt: now }
							: interval,
					),
				};
			}),
		);
	}

	function continueTask(id: string) {
		setTasks((prev) =>
			prev.map((t) =>
				t.id === id
					? {
							...t,
							status: TaskStatus.IN_PROGRESS,
							intervals: [...t.intervals, { startedAt: new Date(), endedAt: null }],
						}
					: t,
			),
		);
	}

	function stopTask(id: string) {
		const now = new Date();
		setTasks((prev) =>
			prev.map((t) => {
				if (t.id !== id) return t;
				return {
					...t,
					status: TaskStatus.COMPLETED,
					intervals: t.intervals.map((interval, i) =>
						i === t.intervals.length - 1 && interval.endedAt === null
							? { ...interval, endedAt: now }
							: interval,
					),
				};
			}),
		);
	}

	return (
		<TaskContext
			value={{
				tasks,
				groups,
				addTask,
				addGroup,
				updateTask,
				deleteTask,
				startTask,
				pauseTask,
				continueTask,
				stopTask,
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
