import { useEffect, useState } from "react";
import { TaskStatus, calculateDuration } from "@/contexts/task-context";
import type { Task } from "@/contexts/task-context";
import { formatDuration } from "@/lib/format-duration";

interface TaskDurationProps {
	intervals: Task["intervals"];
	status: Task["status"];
}

export function TaskDuration({ intervals, status }: TaskDurationProps) {
	const [, setTick] = useState(0);

	useEffect(() => {
		if (status !== TaskStatus.IN_PROGRESS) return;
		const id = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(id);
	}, [status]);

	const isRunning = status === TaskStatus.IN_PROGRESS;

	return (
		<span className={`font-mono text-xs tabular-nums ${isRunning ? "font-medium text-foreground" : "font-normal text-muted-foreground"}`}>
			{formatDuration(calculateDuration(intervals))}
		</span>
	);
}
