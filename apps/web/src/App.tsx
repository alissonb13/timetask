import {
	CalendarDaysIcon,
	ListIcon,
	MoonIcon,
	PlusIcon,
	SunIcon,
	TimerIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	useCalendarMonth,
	useCalendarYear,
} from "@/components/kibo-ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDuration, useTaskContext } from "@/contexts/task-context";
import { formatDuration } from "@/lib/format-duration";
import { NewTaskDialog } from "./components/tasks/new-task-dialog";
import { TaskCalendar } from "./components/tasks/task-calendar";
import { TaskList } from "./components/tasks/task-list";

const tabs = [
	{ label: "List", value: "list", icon: <ListIcon size={14} /> },
	{
		label: "Calendar",
		value: "calendar",
		icon: <CalendarDaysIcon size={14} />,
	},
];

function usePeriodTotal() {
	const { tasks } = useTaskContext();
	const [calendarMonth] = useCalendarMonth();
	const [calendarYear] = useCalendarYear();

	const weekTotal = useMemo(() => {
		const now = new Date();
		const dayOfWeek = now.getDay(); // 0 = Sun
		const weekStart = new Date(now);
		weekStart.setDate(now.getDate() - dayOfWeek);
		weekStart.setHours(0, 0, 0, 0);
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 7);

		return tasks
			.filter((t) => t.createdAt >= weekStart && t.createdAt < weekEnd)
			.reduce((sum, t) => sum + calculateDuration(t.intervals), 0);
	}, [tasks]);

	const monthTotal = useMemo(() => {
		return tasks
			.filter((t) => {
				const d = t.createdAt;
				return (
					d.getFullYear() === calendarYear && d.getMonth() === calendarMonth
				);
			})
			.reduce((sum, t) => sum + calculateDuration(t.intervals), 0);
	}, [tasks, calendarMonth, calendarYear]);

	return { weekTotal, monthTotal, calendarMonth, calendarYear };
}

function App() {
	const [newTaskOpen, setNewTaskOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("list");
	const [dark, setDark] = useState(() => {
		const saved = localStorage.getItem("timetask:theme");
		if (saved !== null) return saved === "dark";
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		localStorage.setItem("timetask:theme", dark ? "dark" : "light");
	}, [dark]);

	const { weekTotal, monthTotal, calendarMonth, calendarYear } =
		usePeriodTotal();

	const isCalendar = activeTab === "calendar";
	const periodLabel = isCalendar
		? new Date(calendarYear, calendarMonth).toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
			})
		: "This week";
	const periodTotal = isCalendar ? monthTotal : weekTotal;

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
				<Tabs
					defaultValue="list"
					className="w-full"
					onValueChange={setActiveTab}
				>
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
						<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
							<span>{periodLabel}</span>
							<span className="text-border/80">·</span>
							<span className="font-mono font-semibold tabular-nums text-foreground">
								{formatDuration(periodTotal)}
							</span>
						</div>
					</div>
					<TabsContent value="list" className="mt-0">
						<TaskList />
					</TabsContent>
					<TabsContent value="calendar" className="mt-0">
						<TaskCalendar />
					</TabsContent>
				</Tabs>
			</main>

			<NewTaskDialog open={newTaskOpen} onOpenChange={setNewTaskOpen} />
		</div>
	);
}

export default App;
