import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatus, useTaskContext, type Task } from "@/contexts/task-context";
import { EditTaskDialog } from "./edit-task-dialog";

interface TaskMenuProps {
	task: Task;
}

export function TaskMenu({ task }: TaskMenuProps) {
	const { deleteTask } = useTaskContext();
	const [editOpen, setEditOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
						onClick={(e) => e.stopPropagation()}
					>
						<EllipsisIcon size={16} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					<DropdownMenuItem
						disabled={task.status === TaskStatus.COMPLETED}
						onClick={() => setEditOpen(true)}
					>
						<PencilIcon size={14} />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => deleteTask(task.id)}
					>
						<Trash2Icon size={14} />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
		</>
	);
}
