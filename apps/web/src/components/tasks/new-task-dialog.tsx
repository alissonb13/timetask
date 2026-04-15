import { PlusIcon } from "lucide-react";
import { useState } from "react";
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
import { useTaskContext } from "@/contexts/task-context";
import { NewGroupDialog } from "./new-group-dialog";

interface NewTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTaskDialog({ open, onOpenChange }: NewTaskDialogProps) {
	const { groups, addTask } = useTaskContext();
	const [title, setTitle] = useState("");
	const [group, setGroup] = useState("");
	const [groupDialogOpen, setGroupDialogOpen] = useState(false);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		addTask(title.trim(), group);
		setTitle("");
		setGroup("");
		onOpenChange(false);
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>New Task</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="task-title">Title</Label>
							<Input
								id="task-title"
								placeholder="What are you working on?"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								autoFocus
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Group</Label>
							<div className="flex gap-2">
								<Select value={group} onValueChange={setGroup}>
									<SelectTrigger className="flex-1">
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
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() => setGroupDialogOpen(true)}
								>
									<PlusIcon />
								</Button>
							</div>
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
								Create Task
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<NewGroupDialog
				open={groupDialogOpen}
				onOpenChange={setGroupDialogOpen}
			/>
		</>
	);
}
