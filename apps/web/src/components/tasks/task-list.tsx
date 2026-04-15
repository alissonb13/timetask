import { ClockIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDuration } from "@/lib/format-duration";
import { TaskStatus, calculateDuration, useTaskContext, type Task } from "@/contexts/task-context";
import { TaskActions } from "./task-actions";
import { TaskMenu } from "./task-menu";
import { TaskDuration } from "./task-duration";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskTimeRangeSummary, TaskTimeRangeHistory } from "./task-time-range";

type TaskGroup = {
	label: string;
	dateKey: string;
	tasks: Task[];
	totalDuration: number;
};

function formatDateLabel(date: Date): string {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	const formatted = date.toLocaleDateString("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

	if (date.toDateString() === today.toDateString())
		return `Today — ${formatted}`;
	if (date.toDateString() === yesterday.toDateString())
		return `Yesterday — ${formatted}`;
	return formatted;
}

const STATUS_ORDER: Record<string, number> = {
	[TaskStatus.IN_PROGRESS]: 0,
	[TaskStatus.PAUSED]: 1,
	[TaskStatus.PENDING]: 2,
	[TaskStatus.COMPLETED]: 3,
};

function sortTasks(taskList: Task[]): Task[] {
	return [...taskList].sort((a, b) => {
		const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
		if (statusDiff !== 0) return statusDiff;
		return a.title.localeCompare(b.title);
	});
}

function groupTasksByDate(taskList: Task[]): TaskGroup[] {
	const map = new Map<string, TaskGroup>();

	for (const task of taskList) {
		const dateKey = task.createdAt.toDateString();
		if (!map.has(dateKey)) {
			map.set(dateKey, {
				label: formatDateLabel(task.createdAt),
				dateKey,
				tasks: [],
				totalDuration: 0,
			});
		}
		const group = map.get(dateKey);
		if (group) {
			group.tasks.push(task);
			group.totalDuration += calculateDuration(task.intervals);
		}
	}

	return [...map.values()]
		.sort((a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime())
		.map((group) => ({ ...group, tasks: sortTasks(group.tasks) }));
}

export function TaskList() {
	const { tasks, deleteTask } = useTaskContext();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

	function toggleExpand(id: string, e: React.MouseEvent) {
		e.stopPropagation();
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}
	const groups = useMemo(() => groupTasksByDate(tasks), [tasks]);

	function toggleSelect(id: string) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function toggleSelectGroup(groupTasks: Task[]) {
		const groupIds = groupTasks.map((t) => t.id);
		const allSelected = groupIds.every((id) => selectedIds.has(id));
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allSelected) {
				for (const id of groupIds) next.delete(id);
			} else {
				for (const id of groupIds) next.add(id);
			}
			return next;
		});
	}

	function deleteSelected(groupTasks: Task[]) {
		const groupIds = groupTasks.map((t) => t.id).filter((id) => selectedIds.has(id));
		for (const id of groupIds) deleteTask(id);
		setSelectedIds((prev) => {
			const next = new Set(prev);
			for (const id of groupIds) next.delete(id);
			return next;
		});
	}

	if (tasks.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-20 gap-3">
				<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
					<ClockIcon size={18} className="text-muted-foreground" />
				</div>
				<div className="text-center space-y-1">
					<p className="text-sm font-medium text-foreground">No tasks yet</p>
					<p className="text-xs text-muted-foreground">Create a task to start tracking your time</p>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
			{groups.map((group, groupIndex) => {
				const groupIds = group.tasks.map((t) => t.id);
				const selectedInGroup = groupIds.filter((id) => selectedIds.has(id));
				const allSelected = selectedInGroup.length === group.tasks.length;
				const someSelected = selectedInGroup.length > 0 && !allSelected;

				return (
					<div key={group.dateKey}>
						{groupIndex > 0 && <div className="border-t border-border/60" />}

						<div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border/60">
							<div className="flex items-center gap-2.5">
								<Checkbox
									checked={allSelected ? true : someSelected ? "indeterminate" : false}
									onCheckedChange={() => toggleSelectGroup(group.tasks)}
								/>
								<span className="text-xs font-medium text-foreground tracking-wide">{group.label}</span>
								<span className="text-muted-foreground/40 text-xs">·</span>
								<span className="text-xs text-muted-foreground">
									{group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
								</span>
								{selectedInGroup.length > 0 && (
									<Button
										size="xs"
										variant="ghost"
										className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 px-2 gap-1"
										onClick={() => deleteSelected(group.tasks)}
									>
										<Trash2Icon size={12} />
										Delete {selectedInGroup.length === 1 ? "task" : `${selectedInGroup.length} tasks`}
									</Button>
								)}
							</div>
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<ClockIcon size={11} />
								<span className="font-mono font-medium tabular-nums text-foreground">
									{formatDuration(group.totalDuration)}
								</span>
							</div>
						</div>

						{group.tasks.map((task) => {
							const isSelected = selectedIds.has(task.id);
							const isExpanded = expandedIds.has(task.id);

							return (
								<div
									key={task.id}
									className={[
										"border-b border-border/40 last:border-b-0 transition-colors duration-100",
										isSelected ? "bg-muted/60" : "hover:bg-muted/30",
									].join(" ")}
								>
									<div className="grid grid-cols-[2.5rem_3fr_1.5fr_1.5fr_2fr_1.5fr_2fr_2.5rem]">
										<div className="pl-4 py-3 flex items-center">
											<Checkbox
												checked={isSelected}
												onCheckedChange={() => toggleSelect(task.id)}
											/>
										</div>
										<div className={`px-3 py-3 flex items-center text-sm break-words min-w-0 ${task.status === TaskStatus.COMPLETED ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground"}`}>
											{task.title}
										</div>
										<div className="px-2 py-3 flex items-center">
											<TaskStatusBadge status={task.status} />
										</div>
										<div className="px-2 py-3 flex items-center text-xs text-muted-foreground truncate">
											{task.group}
										</div>
										<div className="px-2 py-3 flex items-center">
											<TaskTimeRangeSummary
												intervals={task.intervals}
												expanded={isExpanded}
												onToggle={(e) => toggleExpand(task.id, e)}
											/>
										</div>
										<div className="px-2 py-3 flex items-center">
											<TaskDuration intervals={task.intervals} status={task.status} />
										</div>
										<div className="px-2 py-3 flex items-center">
											<TaskActions taskId={task.id} status={task.status} />
										</div>
										<div className="pr-3 py-3 flex items-center justify-end">
											<TaskMenu task={task} />
										</div>
									</div>
									{isExpanded && task.intervals.length > 0 && (
										<TaskTimeRangeHistory
											intervals={task.intervals}
											status={task.status}
										/>
									)}
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}
