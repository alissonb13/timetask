import {
  CalendarDaysIcon,
  FolderIcon,
  ListIcon,
  MenuIcon,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDuration, useTaskContext } from "@/contexts/task-context";
import { formatDuration } from "@/lib/format-duration";
import { GroupsManager } from "./components/tasks/groups-manager";
import { NewTaskDialog } from "./components/tasks/new-task-dialog";
import { TaskCalendar } from "./components/tasks/task-calendar";
import { TaskList } from "./components/tasks/task-list";

const taskTabs = [
  { label: "List", value: "list", icon: <ListIcon size={14} /> },
  {
    label: "Calendar",
    value: "calendar",
    icon: <CalendarDaysIcon size={14} />,
  },
];

type Section = "tasks" | "groups";

const NAV_ITEMS: { value: Section; label: string; icon: React.ReactNode }[] = [
  { value: "tasks", label: "Tasks", icon: <ListIcon size={16} /> },
  { value: "groups", label: "Groups", icon: <FolderIcon size={16} /> },
];

function usePeriodTotal() {
  const { tasks } = useTaskContext();
  const [calendarMonth] = useCalendarMonth();
  const [calendarYear] = useCalendarYear();

  const weekTotal = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
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
  const [section, setSection] = useState<Section>("tasks");
  const [activeTab, setActiveTab] = useState("list");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  function handleNavSelect(s: Section) {
    setSection(s);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between relative">

          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={18} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <TimerIcon size={14} className="text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                TimeTask
              </span>
            </div>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-stretch h-full">
            {(["tasks", "groups"] as Section[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={[
                  "relative px-4 flex items-center text-sm font-medium transition-colors duration-150",
                  section === s
                    ? "text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-px after:bg-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </nav>

          {/* Right: theme (desktop only) + new task */}
          <div className="flex items-center gap-1.5">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="hidden md:flex text-muted-foreground hover:text-foreground"
            >
              {dark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
            </Button>
            <Button size="sm" onClick={() => setNewTaskOpen(true)}>
              <PlusIcon size={14} />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 flex flex-col gap-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>

          <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border/60 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <TimerIcon size={14} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              TimeTask
            </span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleNavSelect(item.value)}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  section === item.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        {section === "tasks" ? (
          <Tabs
            defaultValue="list"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <TabsList className="h-8 self-start">
                {taskTabs.map((tab) => (
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
        ) : (
          <GroupsManager />
        )}
      </main>

      <NewTaskDialog open={newTaskOpen} onOpenChange={setNewTaskOpen} />

      <footer className="border-t border-border/40 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-center">
          <p className="text-[11px] text-muted-foreground/40">
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/alissonboucinhas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-foreground transition-colors font-medium"
            >
              @boucinhas.dev
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
