import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTaskContext, type Task } from "@/contexts/task-context";

interface EditTaskDialogProps {
	task: Task;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
	const { groups, updateTask } = useTaskContext();
	const [title, setTitle] = useState(task.title);
	const [group, setGroup] = useState(task.group);

	useEffect(() => {
		if (open) {
			setTitle(task.title);
			setGroup(task.group);
		}
	}, [open, task.title, task.group]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		updateTask(task.id, { title: title.trim(), group });
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Task</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="edit-task-title">Title</Label>
						<Input
							id="edit-task-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoFocus
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Group</Label>
						<Select value={group} onValueChange={setGroup}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a group" />
							</SelectTrigger>
							<SelectContent>
								{groups.map((g) => (
									<SelectItem key={g} value={g}>
										{g}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!title.trim() || !group}>
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
