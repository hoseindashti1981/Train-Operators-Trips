import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  bookIsCustom,
  countHours,
  dayKindLabel,
  DEFAULT_PAIRS,
  faNum,
  normalizeHourInput,
  pairsEqual,
  type DayKind,
  type TimePair,
  type TimetableBook,
} from "@/lib/lohe";

const KINDS: DayKind[] = ["weekday", "thursday", "friday"];

export function HoursEditor({
  book,
  onChange,
}: {
  book: TimetableBook;
  onChange: (next: TimetableBook) => void;
}) {
  const [kind, setKind] = useState<DayKind>("weekday");
  const rows = book[kind];
  const counts = countHours(rows);
  const custom = !pairsEqual(rows, DEFAULT_PAIRS[kind]);

  function setRows(next: TimePair[]) {
    onChange({ ...book, [kind]: next });
  }

  function patch(index: number, side: 0 | 1, raw: string) {
    const next = rows.map((row, i) => {
      if (i !== index) return row;
      const copy: TimePair = [...row];
      copy[side] = raw.trim() === "" ? null : (normalizeHourInput(raw) ?? copy[side]);
      return copy;
    });
    setRows(next);
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">ساعات لوحه خروجی</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            فقط همین ساعت‌ها در پردازش پر می‌شوند. خانه خالی یعنی آن سمت حرکت ندارد. تغییرات در همین مرورگر ذخیره می‌شود.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {custom ? <Badge variant="warn">ویرایش‌شده</Badge> : <Badge variant="ok">پیش‌فرض</Badge>}
          {bookIsCustom(book) ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  weekday: DEFAULT_PAIRS.weekday.map((p) => [...p] as TimePair),
                  thursday: DEFAULT_PAIRS.thursday.map((p) => [...p] as TimePair),
                  friday: DEFAULT_PAIRS.friday.map((p) => [...p] as TimePair),
                })
              }
            >
              <RotateCcw />
              بازگشت همه
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1">
        {KINDS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKind(item)}
            className={cn(
              "h-11 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
              kind === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-fg",
            )}
          >
            {dayKindLabel(item)}
            {!pairsEqual(book[item], DEFAULT_PAIRS[item]) ? (
              <span className="ms-2 text-xs opacity-80">•</span>
            ) : null}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        گلشهر {faNum(counts.gol)} ساعت · تهران {faNum(counts.teh)} ساعت · {faNum(rows.length)} ردیف
      </p>

      <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-border">
        <table className="w-full min-w-[420px] text-right text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">گلشهر</th>
              <th className="px-3 py-2 font-medium">تهران - صادقیه</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${kind}-${i}`} className="border-t border-border">
                <td className="w-10 px-3 py-1.5 tabular-nums text-muted-foreground">{faNum(i + 1)}</td>
                <td className="px-2 py-1.5">
                  <HourInput value={row[0]} onCommit={(v) => patch(i, 0, v)} />
                </td>
                <td className="px-2 py-1.5">
                  <HourInput value={row[1]} onCommit={(v) => patch(i, 1, v)} />
                </td>
                <td className="w-12 px-2 py-1.5">
                  <button
                    type="button"
                    aria-label="حذف ردیف"
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}
                    className="flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-muted hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setRows([...rows, [null, null]])}>
          <Plus />
          ردیف جدید
        </Button>
        {custom ? (
          <Button
            variant="outline"
            onClick={() => setRows(DEFAULT_PAIRS[kind].map((p) => [...p] as TimePair))}
          >
            <RotateCcw />
            پیش‌فرض {dayKindLabel(kind)}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function HourInput({ value, onCommit }: { value: string | null; onCommit: (raw: string) => void }) {
  const [draft, setDraft] = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  const shown = focused ? draft : (value ?? "");

  return (
    <input
      value={shown}
      inputMode="numeric"
      placeholder="—"
      aria-label="ساعت حرکت"
      onFocus={() => {
        setDraft(value ?? "");
        setFocused(true);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        onCommit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3 font-mono text-sm tabular-nums text-fg"
    />
  );
}
