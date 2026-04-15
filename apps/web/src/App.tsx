import {
	CalendarDaysIcon,
	ListIcon,
	MoonIcon,
	PlusIcon,
	SunIcon,
	TimerIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDuration, useTaskContext } from "@/contexts/task-context";
import { formatDuration } from "@/lib/format-duration";
import { NewTaskDialog } from "./components/tasks/new-task-dialog";
import { TaskList } from "./components/tasks/task-list";

const tabs = [
	{ label: "List", value: "list", icon: <ListIcon size={14} /> },
	{
		label: "Calendar",
		value: "calendar",
		icon: <CalendarDaysIcon size={14} />,
	},
];

function App() {
	const { tasks } = useTaskContext();
	const [newTaskOpen, setNewTaskOpen] = useState(false);
	const [dark, setDark] = useState(() => {
		const saved = localStorage.getItem("timetask:theme");
		if (saved !== null) return saved === "dark";
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		localStorage.setItem("timetask:theme", dark ? "dark" : "light");
	}, [dark]);

	const weekTotal = useMemo(
		() => tasks.reduce((sum, t) => sum + calculateDuration(t.intervals), 0),
		[tasks],
	);

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur-sm">
				<div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
							<TimerIcon size={14} className="text-primary-foreground" />
						</div>
						<span className="text-sm font-semibold tracking-tight text-foreground">
							TimeTask
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="icon-sm"
							variant="ghost"
							onClick={() => setDark((d) => !d)}
							aria-label="Toggle theme"
							className="text-muted-foreground hover:text-foreground"
						>
							{dark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
						</Button>
						<Button size="sm" onClick={() => setNewTaskOpen(true)}>
							<PlusIcon size={14} />
							New Task
						</Button>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-6 py-6">
				<Tabs defaultValue={tabs[0].value} className="w-full">
					<div className="flex items-center justify-between mb-4">
						<TabsList className="h-8">
							{tabs.map((tab) => (
								<TabsTrigger
									key={tab.value}
									value={tab.value}
									className="h-7 text-xs gap-1.5 px-3"
								>
									{tab.icon}
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<span>This week</span>
							<span className="text-border/80">·</span>
							<span className="font-mono font-semibold tabular-nums text-foreground text-sm">
								{formatDuration(weekTotal)}
							</span>
						</div>
					</div>
					<TabsContent value="list" className="mt-0">
						<TaskList />
					</TabsContent>
				</Tabs>
			</main>

			<NewTaskDialog open={newTaskOpen} onOpenChange={setNewTaskOpen} />
		</div>
	);
}

export default App;
