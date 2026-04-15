import { CheckIcon, ClockIcon, Loader2Icon, PauseIcon } from "lucide-react";
import { TaskStatus, TaskStatusLabel } from "@/contexts/task-context";
import type { Task } from "@/contexts/task-context";

const pillStyle: Record<string, string> = {
	[TaskStatus.PENDING]:
		"text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50",
	[TaskStatus.IN_PROGRESS]:
		"text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50",
	[TaskStatus.PAUSED]:
		"text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50",
	[TaskStatus.COMPLETED]:
		"text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50",
};

const statusIcon: Record<string, React.ReactNode> = {
	[TaskStatus.PENDING]: <ClockIcon size={11} className="shrink-0" />,
	[TaskStatus.IN_PROGRESS]: <Loader2Icon size={11} className="shrink-0 animate-spin" />,
	[TaskStatus.PAUSED]: <PauseIcon size={11} className="shrink-0" fill="currentColor" />,
	[TaskStatus.COMPLETED]: <CheckIcon size={11} className="shrink-0" strokeWidth={2.5} />,
};

interface TaskStatusBadgeProps {
	status: Task["status"];
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${pillStyle[status]}`}
		>
			{statusIcon[status]}
			{TaskStatusLabel[status]}
		</span>
	);
}
