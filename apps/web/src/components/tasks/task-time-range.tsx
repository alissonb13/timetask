import { format, isSameDay } from "date-fns";
import { ChevronDownIcon, ChevronRightIcon, PauseIcon, PlayIcon, SquareIcon, StepForwardIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TaskStatus, type Task } from "@/contexts/task-context";

interface TaskTimeRangeSummaryProps {
	intervals: Task["intervals"];
	expanded: boolean;
	onToggle: (e: React.MouseEvent) => void;
}

interface TaskTimeRangeHistoryProps {
	intervals: Task["intervals"];
	status: Task["status"];
}

export type TimelineEvent = {
	label: string;
	icon: ReactNode;
	time: Date;
};

export function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
}

const ICON_CLASS = "shrink-0 text-muted-foreground/50";
const ICON_SIZE = 11;

const EVENT_ICONS: Record<string, ReactNode> = {
	Started: <PlayIcon size={ICON_SIZE} className={ICON_CLASS} />,
	Resumed: <StepForwardIcon size={ICON_SIZE} className={ICON_CLASS} />,
	Paused: <PauseIcon size={ICON_SIZE} className={ICON_CLASS} />,
	Finished: <SquareIcon size={ICON_SIZE} className={ICON_CLASS} />,
};

export function buildTimeline(intervals: Task["intervals"], status: Task["status"]): TimelineEvent[] {
	const events: TimelineEvent[] = [];

	intervals.forEach((interval, i) => {
		const isFirst = i === 0;
		const isLast = i === intervals.length - 1;
		const startLabel = isFirst ? "Started" : "Resumed";

		events.push({ label: startLabel, icon: EVENT_ICONS[startLabel], time: interval.startedAt });

		if (interval.endedAt) {
			const endLabel = isLast && status === TaskStatus.COMPLETED ? "Finished" : "Paused";
			events.push({ label: endLabel, icon: EVENT_ICONS[endLabel], time: interval.endedAt });
		}
	});

	return events;
}

function formatDateTime(date: Date, referenceDate: Date): string {
	if (isSameDay(date, referenceDate)) {
		return formatTime(date);
	}
	return `${format(date, "MMM d")} · ${formatTime(date)}`;
}

export function TaskTimeRangeSummary({ intervals, expanded, onToggle }: TaskTimeRangeSummaryProps) {
	if (intervals.length === 0) return null;

	const first = intervals[0];
	const last = intervals[intervals.length - 1];
	const hasEnd = !!last.endedAt;
	const isMultiDay = hasEnd && !isSameDay(first.startedAt, last.endedAt!);

	const startLabel = isMultiDay
		? formatDateTime(first.startedAt, first.startedAt)
		: formatTime(first.startedAt);
	const endLabel = hasEnd
		? formatDateTime(last.endedAt!, first.startedAt)
		: null;

	return (
		<div
			className="flex items-center gap-1.5 cursor-pointer group"
			onClick={onToggle}
		>
			<span className="text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors shrink-0">
				{expanded ? <ChevronDownIcon size={11} /> : <ChevronRightIcon size={11} />}
			</span>
			<span className="font-mono text-xs text-muted-foreground tabular-nums whitespace-nowrap">
				{startLabel}
				{endLabel && (
					<>
						<span className="mx-1 text-muted-foreground/30">–</span>
						{endLabel}
					</>
				)}
			</span>
		</div>
	);
}

export function TaskTimeRangeHistory({ intervals, status }: TaskTimeRangeHistoryProps) {
	const events = buildTimeline(intervals, status);

	return (
		<div className="grid grid-cols-[2.5rem_3fr_1.5fr_1.5fr_2fr_1.5fr_2fr_2.5rem] border-t border-border/30 bg-muted/10">
			<div className="col-start-5 px-2 py-2.5 flex flex-col gap-1.5">
				<TimelineList events={events} />
			</div>
		</div>
	);
}

// ─── Shared timeline renderer ────────────────────────────────────────────────

type TimelineListProps = {
	events: TimelineEvent[];
	className?: string;
};

export function TimelineList({ events, className }: TimelineListProps) {
	if (events.length === 0) return null;

	const isMultiDay = events.some((e) => !isSameDay(e.time, events[0].time));

	const rows: ReactNode[] = [];
	let lastDay: Date | null = null;

	events.forEach((event, i) => {
		if (isMultiDay && (lastDay === null || !isSameDay(event.time, lastDay))) {
			rows.push(
				<div key={`day-${i}`} className="flex items-center gap-1.5 pt-1 first:pt-0">
					<div className="h-px flex-1 bg-border/30" />
					<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/40 select-none">
						{format(event.time, "MMM d")}
					</span>
					<div className="h-px flex-1 bg-border/30" />
				</div>
			);
			lastDay = event.time;
		}

		rows.push(
			<div key={i} className={`flex items-center gap-2 ${className ?? ""}`}>
				<div className="w-[7px] h-[7px] rounded-full border border-border/60 bg-background shrink-0 relative z-10" />
				<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
					{formatTime(event.time)}
				</span>
				<span className="text-[10px] text-muted-foreground/35 uppercase tracking-wider">
					{event.label}
				</span>
			</div>
		);
	});

	return (
		<div className="relative flex flex-col gap-1.5">
			<div className="absolute left-[3px] top-2 bottom-2 w-px bg-border/30 z-0" />
			{rows}
		</div>
	);
}
