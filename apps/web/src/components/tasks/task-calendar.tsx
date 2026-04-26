import { format, startOfDay } from "date-fns";
import {
  Calendar1Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  FolderIcon,
} from "lucide-react";
import { useState } from "react";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  type Feature,
} from "@/components/kibo-ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  TaskStatus,
  calculateDuration,
  useTaskContext,
  type Task,
} from "@/contexts/task-context";
import { formatDuration } from "@/lib/format-duration";
import { TaskActions } from "./task-actions";
import { TaskStatusBadge } from "./task-status-badge";
import { TimelineList, buildTimeline } from "./task-time-range";

const STATUS_COLOR: Record<string, string> = {
  [TaskStatus.PENDING]: "#94a3b8",
  [TaskStatus.IN_PROGRESS]: "#3b82f6",
  [TaskStatus.PAUSED]: "#f59e0b",
  [TaskStatus.COMPLETED]: "#10b981",
};

const STATUS_LABEL: Record<string, string> = {
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.PAUSED]: "Paused",
  [TaskStatus.COMPLETED]: "Completed",
};

function taskToFeature(task: Task): Feature {
  const lastInterval = task.intervals[task.intervals.length - 1];
  const endAt =
    task.status === TaskStatus.COMPLETED && lastInterval?.endedAt
      ? lastInterval.endedAt
      : startOfDay(new Date());

  return {
    id: task.id,
    name: task.title,
    startAt: task.createdAt,
    endAt,
    status: {
      id: task.status,
      name: STATUS_LABEL[task.status],
      color: STATUS_COLOR[task.status],
    },
  };
}

type TaskCalendarItemProps = {
  feature: Feature;
  task: Task;
};

function TaskCalendarItem({ feature, task }: TaskCalendarItemProps) {
  const duration = calculateDuration(task.intervals);
  const timeline = buildTimeline(task.intervals, task.status);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="flex items-center gap-1.5 text-xs py-0.5 px-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity w-full"
          style={{ backgroundColor: `${feature.status.color}18` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: feature.status.color }}
          />
          <span
            className="truncate font-medium"
            style={{ color: feature.status.color }}
          >
            {feature.name}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 overflow-hidden" align="start">
        <div
          className="h-1 w-full"
          style={{ backgroundColor: feature.status.color }}
        />
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            <p
              className={`text-sm font-medium leading-snug ${task.status === TaskStatus.COMPLETED ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {task.title}
            </p>
            <TaskStatusBadge status={task.status} />
          </div>
          <div className="border-t border-border/50" />
          <div className="space-y-2">
            {task.group && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderIcon size={12} className="shrink-0" />
                <span>{task.group}</span>
              </div>
            )}
            {duration > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ClockIcon size={12} className="shrink-0" />
                <span className="font-mono tabular-nums text-foreground font-medium">
                  {formatDuration(duration)}
                </span>
                <span className="text-muted-foreground/50">total</span>
              </div>
            )}
            {timeline.length > 0 && (
              <div className="pt-0.5">
                <TimelineList events={timeline} />
              </div>
            )}
          </div>
          {task.status !== TaskStatus.COMPLETED && (
            <>
              <div className="border-t border-border/50" />
              <div className="flex justify-end">
                <TaskActions taskId={task.id} status={task.status} />
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type DaySheetProps = {
  date: Date | null;
  tasks: Task[];
  taskMap: Map<string, Task>;
  features: Feature[];
  onClose: () => void;
};

function DaySheetTask({ task }: { task: Task }) {
  const [timelineOpen, setTimelineOpen] = useState(false);
  const duration = calculateDuration(task.intervals);
  const color = STATUS_COLOR[task.status];
  const timeline = buildTimeline(task.intervals, task.status);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  return (
    <div className="group relative pl-6 pr-5 py-4 border-b border-border/25 last:border-b-0 hover:bg-muted/20 transition-colors">
      {/* Status accent bar — full card height */}
      <div
        className="absolute left-0 inset-y-0 w-0.75"
        style={{ backgroundColor: color, opacity: isCompleted ? 0.3 : 0.65 }}
      />

      {/* Title + actions */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p
          className={`text-sm font-medium leading-snug ${
            isCompleted
              ? "line-through text-muted-foreground/60"
              : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        {!isCompleted && (
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <TaskActions taskId={task.id} status={task.status} />
          </div>
        )}
      </div>

      {/* Meta: status badge + group chip — same size */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
        <TaskStatusBadge status={task.status} />
        {task.group && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border/50 text-xs font-medium text-muted-foreground bg-muted/40">
            <FolderIcon size={11} className="shrink-0" />
            {task.group}
          </span>
        )}
      </div>

      {/* Duration — clickable to toggle timeline */}
      {duration > 0 && (
        <div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs group/dur"
            onClick={() => setTimelineOpen((v) => !v)}
          >
            <span className="text-muted-foreground/30 group-hover/dur:text-muted-foreground/60 transition-colors">
              {timelineOpen ? (
                <ChevronDownIcon size={10} />
              ) : (
                <ChevronRightIcon size={10} />
              )}
            </span>
            <ClockIcon
              size={10}
              className="text-muted-foreground/40 shrink-0"
            />
            <span className="font-mono tabular-nums text-foreground font-semibold tracking-tight">
              {formatDuration(duration)}
            </span>
          </button>

          {/* Timeline — collapsible, dot-connected */}
          {timelineOpen && timeline.length > 0 && (
            <div className="mt-2.5 ml-4.5">
              <TimelineList events={timeline} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DaySheet({ date, tasks, onClose }: DaySheetProps) {
  const totalDuration = tasks.reduce(
    (sum, t) => sum + calculateDuration(t.intervals),
    0,
  );

  return (
    <Sheet open={!!date} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header — visually hidden SheetTitle for a11y, custom layout below */}
        <SheetHeader className="sr-only">
          <SheetTitle>{date ? format(date, "EEEE, MMMM d") : ""}</SheetTitle>
        </SheetHeader>
        <div className="px-6 pt-5 pb-4 border-b border-border/40 shrink-0">
          {/* Date */}
          <div className="flex items-center gap-2.5">
            <Calendar1Icon
              size={13}
              className="text-muted-foreground/50 shrink-0"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground leading-none">
              {date ? format(date, "EEEE, MMMM d") : ""}
            </span>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-2.5 mt-3 text-xs pl-5.5">
            <div className="flex items-center gap-1">
              <span className="font-semibold tabular-nums text-foreground">
                {tasks.length}
              </span>
              <span className="text-muted-foreground/60">
                {tasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            {totalDuration > 0 && (
              <>
                <span className="text-border/40 select-none">·</span>
                <div className="flex items-center gap-1.5">
                  <ClockIcon
                    size={11}
                    className="text-muted-foreground/40 shrink-0"
                  />
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {tasks.map((task) => (
            <DaySheetTask key={task.id} task={task} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TaskCalendar() {
  const { tasks } = useTaskContext();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const features = tasks.map(taskToFeature);
  const currentYear = new Date().getFullYear();

  function handleDayClick(date: Date, dayFeatures: Feature[]) {
    setSelectedDay(date);
    setSelectedFeatures(dayFeatures);
  }

  const selectedTasks = selectedFeatures
    .map((f) => taskMap.get(f.id))
    .filter((t): t is Task => !!t);

  return (
    <>
      <CalendarProvider
        locale="en-US"
        startDay={0}
        className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
      >
        <CalendarDate>
          <CalendarDatePicker>
            <CalendarMonthPicker className="w-28 sm:w-40" />
            <CalendarYearPicker
              className="w-20 sm:w-32"
              start={currentYear - 2}
              end={currentYear + 2}
            />
          </CalendarDatePicker>
          <CalendarDatePagination />
        </CalendarDate>
        <CalendarHeader />
        <CalendarBody
          features={features}
          onDayClick={handleDayClick}
          maxItemsPerDay={3}
        >
          {({ feature }) => {
            const task = taskMap.get(feature.id);
            if (!task) return null;
            return (
              <TaskCalendarItem
                key={feature.id}
                feature={feature}
                task={task}
              />
            );
          }}
        </CalendarBody>
      </CalendarProvider>

      <DaySheet
        date={selectedDay}
        tasks={selectedTasks}
        taskMap={taskMap}
        features={selectedFeatures}
        onClose={() => setSelectedDay(null)}
      />
    </>
  );
}
