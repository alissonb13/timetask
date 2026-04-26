import { format, isToday, startOfDay } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGroupContext } from "@/contexts/group-context";
import { useTaskContext } from "@/contexts/task-context";
import { NewGroupDialog } from "./new-group-dialog";

interface NewTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTaskDialog({ open, onOpenChange }: NewTaskDialogProps) {
	const { groups } = useGroupContext();
	const { addTask } = useTaskContext();
	const activeGroups = groups.filter((g) => !g.deletedAt);
	const [title, setTitle] = useState("");
	const [group, setGroup] = useState("");
	const [date, setDate] = useState<Date>(startOfDay(new Date()));
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [groupDialogOpen, setGroupDialogOpen] = useState(false);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		addTask(title.trim(), group, date);
		setTitle("");
		setGroup("");
		setDate(startOfDay(new Date()));
		onOpenChange(false);
	}

	function handleSelectDate(selected: Date | undefined) {
		if (selected) {
			setDate(startOfDay(selected));
			setCalendarOpen(false);
		}
	}

	const dateLabel = isToday(date) ? `Today, ${format(date, "MMM d")}` : format(date, "MMM d, yyyy");

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
										{activeGroups.map((g) => (
											<SelectItem key={g.id} value={g.name}>
												{g.name}
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

						<div className="space-y-1.5">
							<Label>Date</Label>
							<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										className="w-full justify-start gap-2 font-normal"
									>
										<CalendarIcon size={14} className="text-muted-foreground" />
										{dateLabel}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={date}
										onSelect={handleSelectDate}
										disabled={{ before: startOfDay(new Date()) }}
										defaultMonth={date}
									/>
								</PopoverContent>
							</Popover>
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
