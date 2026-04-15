import { PauseIcon, PlayIcon, SquareIcon, StepForwardIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTaskContext } from "@/contexts/task-context";
import type { Task } from "@/contexts/task-context";
import { TaskStatus } from "@/contexts/task-context";

interface TaskActionsProps {
	taskId: string;
	status: Task["status"];
}

export function TaskActions({ taskId, status }: TaskActionsProps) {
	const { startTask, pauseTask, continueTask, stopTask } = useTaskContext();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [wasInProgress, setWasInProgress] = useState(false);

	function handleStopClick(e: React.MouseEvent) {
		e.stopPropagation();
		if (status === TaskStatus.IN_PROGRESS) {
			pauseTask(taskId);
			setWasInProgress(true);
		} else {
			setWasInProgress(false);
		}
		setConfirmOpen(true);
	}

	function handleConfirm() {
		stopTask(taskId);
		setConfirmOpen(false);
	}

	function handleCancel() {
		if (wasInProgress) {
			continueTask(taskId);
		}
		setConfirmOpen(false);
	}

	return (
		<>
			<div className="flex flex-row gap-1 justify-end">
				{status === TaskStatus.PENDING && (
					<Button
						size="icon-xs"
						variant="ghost"
						className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
						onClick={(e) => { e.stopPropagation(); startTask(taskId); }}
					>
						<PlayIcon fill="currentColor" />
					</Button>
				)}
				{status === TaskStatus.IN_PROGRESS && (
					<Button
						size="icon-xs"
						variant="ghost"
						className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
						onClick={(e) => { e.stopPropagation(); pauseTask(taskId); }}
					>
						<PauseIcon fill="currentColor" />
					</Button>
				)}
				{status === TaskStatus.PAUSED && (
					<Button
						size="icon-xs"
						variant="ghost"
						className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
						onClick={(e) => { e.stopPropagation(); continueTask(taskId); }}
					>
						<StepForwardIcon fill="currentColor" />
					</Button>
				)}
				{(status === TaskStatus.IN_PROGRESS || status === TaskStatus.PAUSED) && (
					<Button
						size="icon-xs"
						variant="ghost"
						className="text-rose-400 hover:text-rose-500 hover:bg-rose-50"
						onClick={handleStopClick}
					>
						<SquareIcon fill="currentColor" />
					</Button>
				)}
			</div>

			<Dialog open={confirmOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
				<DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
					<DialogHeader>
						<DialogTitle>Finish task?</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						Are you sure you want to finish this task? This action cannot be undone.
					</p>
					<DialogFooter>
						<Button variant="outline" size="sm" onClick={handleCancel}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={handleConfirm}>
							Finish task
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
