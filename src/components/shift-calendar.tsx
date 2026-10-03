import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  JALALI_MONTHS,
  SHIFT_ANCHOR,
  addJalaliMonth,
  dayShiftOn,
  formatJalali,
  jalaliToday,
  monthGrid,
  type DayShift,
  type JalaliDate,
} from "@/lib/lohe";

const WEEK_HEAD = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

function letterClass(kind: "morning" | "evening" | "rest") {
  if (kind === "morning") return "bg-emerald-500/20 text-emerald-200";
  if (kind === "evening") return "bg-sky-500/20 text-sky-200";
  return "bg-zinc-500/20 text-zinc-300";
}

export function ShiftCalendar({
  selected,
  onSelect,
}: {
  selected?: JalaliDate | null;
  onSelect?: (day: DayShift) => void;
}) {
  const today = useMemo(() => jalaliToday(), []);
  const initial = selected ?? today;
  const [cursor, setCursor] = useState({ jy: initial.jy, jm: initial.jm });
  const cells = useMemo(() => monthGrid(cursor.jy, cursor.jm), [cursor.jy, cursor.jm]);
  const monthName = JALALI_MONTHS[cursor.jm - 1];
  const selectedIso = selected ? formatJalali(selected) : "";
  const todayIso = formatJalali(today);
  const preview = selected ? dayShiftOn(selected) : dayShiftOn(today);

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <p className="text-sm text-muted-foreground">
          تقویم ابدی شیفت از مبدأ {formatJalali(SHIFT_ANCHOR)} (روز ۱ · صبح B · عصر A · استراحت C). هر دو روز یک الگو؛ جمعه هم همان چرخه است.
        </p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
          <Info label="تاریخ" value={`${preview.weekdayName} ${preview.iso}`} />
          <Info label="روز شیفت" value={`${preview.blockDay}`} />
          <Info label="صبحکار" value={preview.morning} tone="morning" />
          <Info label="عصرکار" value={preview.evening} tone="evening" />
          <Info label="استراحت" value={preview.rest} tone="rest" />
          <Info label="۱۲ صبح‌زود" value={preview.early12} />
          <Info label="۱۲ روز / شب" value={`${preview.day12} / ${preview.night12}`} />
          <Info label="گروه ۱۲ ساعته" value={String(preview.groups12)} />
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setCursor(addJalaliMonth(cursor.jy, cursor.jm, -1))}>
            <ChevronRight />
          </Button>
          <h2 className="text-base font-semibold">
            {monthName} {cursor.jy}
          </h2>
          <Button variant="outline" size="sm" onClick={() => setCursor(addJalaliMonth(cursor.jy, cursor.jm, 1))}>
            <ChevronLeft />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEK_HEAD.map((d) => (
            <div key={d} className="py-1 font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="min-h-16" />;
            const isSelected = day.iso === selectedIso;
            const isToday = day.iso === todayIso;
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => onSelect?.(day)}
                className={cn(
                  "min-h-16 rounded-[var(--radius-sm)] border px-1 py-1 text-right transition-colors",
                  isSelected ? "border-primary bg-primary/15" : "border-border bg-elevated hover:border-primary/50",
                  isToday && !isSelected ? "ring-1 ring-primary/40" : "",
                )}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="tabular-nums text-muted-foreground">{day.blockDay}</span>
                  <span className="font-semibold tabular-nums">{day.jd}</span>
                </div>
                <div className="mt-1 flex justify-between gap-0.5 text-[10px] font-semibold">
                  <span className={cn("rounded px-0.5", letterClass("morning"))}>{day.morning}</span>
                  <span className={cn("rounded px-0.5", letterClass("evening"))}>{day.evening}</span>
                  <span className={cn("rounded px-0.5", letterClass("rest"))}>{day.rest}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          سبز صبحکار · آبی عصرکار · خاکستری استراحت · عدد کوچک روز ۱ یا ۲ بلوک
        </p>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "morning" | "evening" | "rest";
}) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-semibold", tone && letterClass(tone))}>{value}</p>
    </div>
  );
}
