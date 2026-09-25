import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  Loader2,
  Printer,
  Search,
  TrainFront,
  Upload,
  Users,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoursEditor } from "@/components/hours-editor";
import { LohePrintSurface, printLohe } from "@/components/lohe-print";
import { PwaBar } from "@/components/pwa-bar";
import { cn } from "@/lib/utils";
import { GITHUB_PWA_URL } from "@/lib/pwa/register";
import { publicUrl } from "@/lib/public-url";
import {
  bookIsCustom,
  cloneDefaultBook,
  dayKindLabel,
  downloadWorkbook,
  faNum,
  loadTimetableBook,
  processTrips,
  processWorkbook,
  roleLabel,
  saveTimetableBook,
  stationLabel,
  stationShort,
  type CrewMember,
  type DayKind,
  type DriverRow,
  type ProcessResult,
  type SlotAssignment,
  type StationKind,
  type TimetableBook,
  type TimetableRow,
} from "@/lib/lohe";

type TabId = "roster" | "drivers" | "detail" | "warnings" | "hours";
type DayChoice = "auto" | DayKind;

const TABS: { id: TabId; label: string }[] = [
  { id: "roster", label: "لوحه پردازش" },
  { id: "drivers", label: "گزارش راهبران" },
  { id: "detail", label: "جزئیات اعزام" },
  { id: "warnings", label: "هشدارها" },
  { id: "hours", label: "ساعات خروجی" },
];

function slotAt(
  slots: SlotAssignment[],
  origin: StationKind,
  time: string | null,
): SlotAssignment | null {
  if (!time) return null;
  return slots.find((s) => s.origin === origin && s.time === time) ?? null;
}

function crewText(people: CrewMember[]): string {
  if (people.length === 0) return "—";
  return people.map((p) => p.displayName).join(" / ");
}

export function LoheApp() {
  const inputRef = useRef<HTMLInputElement>(null);
  const runFileRef = useRef<(file: File) => Promise<void>>(async () => {});
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [dayChoice, setDayChoice] = useState<DayChoice>("auto");
  const [tab, setTab] = useState<TabId>("roster");
  const [query, setQuery] = useState("");
  const [showTrainee, setShowTrainee] = useState(false);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [book, setBook] = useState<TimetableBook>(() => cloneDefaultBook());

  useEffect(() => {
    setBook(loadTimetableBook());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.launchQueue) return;
    window.launchQueue.setConsumer((params) => {
      const handle = params.files?.[0];
      if (!handle) return;
      void handle.getFile().then((file) => runFileRef.current(file));
    });
  }, []);

  function applyBook(next: TimetableBook) {
    setBook(next);
    saveTimetableBook(next);
    if (result) {
      setResult(processTrips(result.trips, result.meta, dayChoice, next));
    }
  }

  async function runFile(file: File, override: DayChoice = dayChoice) {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const processed = await processWorkbook(buf, file.name, override, book);
      setResult(processed);
      setFileLabel(file.name);
      setTab("roster");
      toast.success(`${faNum(processed.stats.namedTripCount)} اعزام از ${file.name} پردازش شد`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "خواندن فایل ناموفق بود";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  runFileRef.current = (file: File) => runFile(file);

  async function loadDemo() {
    setBusy(true);
    try {
      const res = await fetch(publicUrl("samples/gozaresh-avaliye.xls"));
      if (!res.ok) throw new Error("نمونه در دسترس نیست");
      const buf = await res.arrayBuffer();
      const processed = await processWorkbook(buf, "اولیه 3.xls", dayChoice, book);
      setResult(processed);
      setFileLabel("نمونه: اولیه 3.xls");
      setTab("roster");
      toast.success("نمونه گزارش روزانه بارگذاری شد");
    } catch (err) {
      const message = err instanceof Error ? err.message : "بارگذاری نمونه ناموفق بود";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function exportExcel() {
    if (!result) return;
    try {
      await downloadWorkbook(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "خروجی اکسل ساخته نشد";
      toast.error(message);
    }
  }

  function printBoard() {
    if (!result) return;
    printLohe();
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void runFile(file);
  }

  function changeDay(next: DayChoice) {
    setDayChoice(next);
    if (result) {
      setResult(processTrips(result.trips, result.meta, next, book));
    }
  }

  const filteredDrivers = useMemo(() => {
    if (!result) return [];
    const q = query.trim();
    if (!q) return result.drivers;
    return result.drivers.filter((d) =>
      [d.firstName, d.lastName, d.personnelId, ...d.trips.map((t) => t.time)].some((x) =>
        x.includes(q),
      ),
    );
  }, [result, query]);

  const filteredTrips = useMemo(() => {
    if (!result) return [];
    const q = query.trim();
    const crew = result.trips.filter((t) => t.role === "master" || t.role === "slave" || t.role === "trainee");
    if (!q) return crew;
    return crew.filter((t) =>
      [t.firstName, t.lastName, t.personnelId, t.time, t.roleRaw, t.originRaw].some((x) =>
        x.includes(q),
      ),
    );
  }, [result, query]);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Toaster
        position="top-center"
        theme="dark"
        dir="rtl"
        toastOptions={{
          className: "font-sans !bg-elevated !text-fg !border-border",
        }}
      />
      {result ? <LohePrintSurface result={result} /> : null}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-border bg-elevated">
              <TrainFront className="size-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">خط ۵ · گلشهر ↔ صادقیه</p>
              <h1 className="text-xl font-semibold leading-snug sm:text-2xl">لوحه‌ساز سیر و اعزام</h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                گزارش روزانه را بگذارید؛ فقط راهبر و کمک‌راهبر ساعت‌های شیت خروجی پر می‌شود.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
              <Upload />
              بارگذاری اولیه
            </Button>
            <Button variant="outline" onClick={() => void loadDemo()} disabled={busy}>
              <FileSpreadsheet />
              نمونه گزارش
            </Button>
            <Button onClick={() => void exportExcel()} disabled={!result}>
              <Download />
              خروجی اکسل
            </Button>
            <Button variant="outline" onClick={() => void printBoard()} disabled={!result}>
              <Printer />
              چاپ لوحه
            </Button>
            <PwaBar />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFiles(e.dataTransfer.files);
          }}
          className={cn(
            "rounded-[var(--radius-xl)] border border-dashed bg-surface p-5 transition-colors duration-[var(--motion-fast)] sm:p-6",
            dragging ? "border-primary bg-elevated" : "border-border",
          )}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium">فایل گزارش اولیه (xls / xlsx)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {fileLabel ?? "فایل را بکشید اینجا یا از نمونه آماده استفاده کنید."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                نوع روز
                <select
                  value={dayChoice}
                  onChange={(e) => changeDay(e.target.value as DayChoice)}
                  className="h-11 min-w-40 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm text-fg"
                >
                  <option value="auto">تشخیص خودکار از تاریخ</option>
                  <option value="weekday">روز عادی</option>
                  <option value="thursday">پنجشنبه</option>
                  <option value="friday">جمعه</option>
                </select>
              </label>
              <label className="flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm">
                <input
                  type="checkbox"
                  checked={showTrainee}
                  onChange={(e) => setShowTrainee(e.target.checked)}
                  className="size-4 accent-primary"
                />
                نمایش راهبر آموزشی
              </label>
              <Button
                variant={tab === "hours" ? "default" : "outline"}
                onClick={() => setTab(tab === "hours" ? "roster" : "hours")}
              >
                <Clock3 />
                ساعات خروجی
                {bookIsCustom(book) ? <span className="text-xs">•</span> : null}
              </Button>
            </div>
          </div>
        </section>

        {busy && (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            در حال پردازش لوحه…
          </div>
        )}

        {!result && !busy && tab !== "hours" && <EmptyGuide onDemo={() => void loadDemo()} onHours={() => setTab("hours")} />}

        {tab === "hours" && (
          <div className="mt-6">
            <HoursEditor book={book} onChange={applyBook} />
          </div>
        )}

        {result && tab !== "hours" && (
          <>
            <StatsRow result={result} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1 rounded-[var(--radius-md)] border border-border bg-surface p-1">
                {TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "h-11 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
                      tab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-fg",
                    )}
                  >
                    {item.id === "hours" ? <Clock3 className="me-1 inline size-3.5" /> : null}
                    {item.label}
                    {item.id === "warnings" && result.warnings.length > 0 ? (
                      <span className="ms-2 tabular-nums">({faNum(result.warnings.length)})</span>
                    ) : null}
                    {item.id === "hours" && bookIsCustom(book) ? (
                      <span className="ms-2 text-xs">•</span>
                    ) : null}
                  </button>
                ))}
              </div>
              {(tab === "drivers" || tab === "detail") && (
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={tab === "drivers" ? "جستجوی فامیل یا کد پرسنلی" : "جستجو در اعزام‌ها"}
                    className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface pe-4 ps-10 text-sm sm:w-72"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              {tab === "roster" && <RosterBoard result={result} showTrainee={showTrainee} />}
              {tab === "drivers" && <DriverTable rows={filteredDrivers} />}
              {tab === "detail" && <DetailTable trips={filteredTrips} />}
              {tab === "warnings" && <WarningsPanel result={result} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyGuide({ onDemo, onHours }: { onDemo: () => void; onHours: () => void }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "۱. گزارش اولیه",
            body: "فایل روزانه اعزام را بارگذاری کنید. ستون‌های نوع اعزام، نام، مبدأ و زمان حرکت به‌صورت خودکار پیدا می‌شوند.",
          },
          {
            title: "۲. تطبیق ساعت خروجی",
            body: "فقط ساعت‌هایی که در لوحه خروجی نوشته‌اید پر می‌شوند. از بخش ساعات خروجی می‌توانید لیست را عوض کنید.",
          },
          {
            title: "۳. گزارش نفرات",
            body: "شیت جدا با مرتب‌سازی فامیلی: نام، نام خانوادگی، شماره پرسنلی و ساعت حرکت‌ها یکی‌یکی.",
          },
        ].map((card) => (
          <article key={card.title} className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-base font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button onClick={onDemo}>
          <FileSpreadsheet />
          مشاهده با نمونه گزارش
        </Button>
        <Button variant="outline" onClick={onHours}>
          <Clock3 />
          ویرایش ساعت‌های خروجی
        </Button>
      </div>
      <p className="pt-2 text-center text-xs leading-relaxed text-muted-foreground">
        برای نصب آفلاین روی گوشی، نسخهٔ گیت‌هاب را در کروم باز کنید:{" "}
        <a className="underline decoration-border underline-offset-4 hover:text-fg" href={GITHUB_PWA_URL} target="_blank" rel="noreferrer">
          لوحه‌ساز روی GitHub Pages
        </a>
      </p>
    </div>
  );
}

function StatsRow({ result }: { result: ProcessResult }) {
  const items = [
    { label: "اعزام نام‌دار", value: faNum(result.stats.namedTripCount), icon: TrainFront, tone: "default" as const },
    { label: "راهبران یکتا", value: faNum(result.stats.driverCount), icon: Users, tone: "default" as const },
    {
      label: "جفت کامل",
      value: faNum(result.stats.filledCrewPairs),
      icon: CheckCircle2,
      tone: "ok" as const,
    },
    {
      label: "کسری ساعت",
      value: faNum(result.stats.vacantSlots),
      icon: AlertTriangle,
      tone: result.stats.vacantSlots > 0 ? ("warn" as const) : ("ok" as const),
    },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">{item.label}</span>
            <item.icon className="size-4" />
          </div>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tabular-nums leading-none",
              item.tone === "ok" && "text-ok",
              item.tone === "warn" && "text-warn",
            )}
          >
            {item.value}
          </p>
          {item.label === "کسری ساعت" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {dayKindLabel(result.dayKind)} · {result.weekdayName}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">{result.meta.processDate || "بدون تاریخ"}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function RosterBoard({ result, showTrainee }: { result: ProcessResult; showTrainee: boolean }) {
  const rows = result.timetableRows;
  const sections: { key: TimetableRow["section"]; title: string }[] = [
    { key: "morning", title: "صبح" },
    { key: "midday", title: "میان‌روز" },
    { key: "evening", title: "پایان خط" },
  ];
  const span = showTrainee ? 4 : 3;
  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface">
      <table className="w-full min-w-[720px] text-right text-sm">
        <thead className="sticky top-0 z-10 bg-muted text-xs text-muted-foreground">
          <tr>
            <th colSpan={span} className="px-3 py-2 font-medium">
              گلشهر → تهران - صادقیه
            </th>
            <th colSpan={span} className="border-r border-border px-3 py-2 font-medium">
              تهران - صادقیه → گلشهر
            </th>
          </tr>
          <tr>
            <HeaderCells showTrainee={showTrainee} />
            <HeaderCells showTrainee={showTrainee} edge />
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => {
            const slice = rows.filter((r) => r.section === section.key);
            if (slice.every((r) => !r.golTime && !r.tehTime)) return null;
            return (
              <RosterSection
                key={section.key}
                title={section.title}
                rows={slice}
                result={result}
                showTrainee={showTrainee}
                span={span}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCells({ showTrainee, edge }: { showTrainee: boolean; edge?: boolean }) {
  const edgeClass = edge ? "border-r border-border" : "";
  return (
    <>
      <th className={cn("px-3 py-2 font-medium", edgeClass)}>ساعت</th>
      <th className="px-3 py-2 font-medium">راهبر (H1)</th>
      <th className="px-3 py-2 font-medium">کمک‌راهبر (R)</th>
      {showTrainee ? <th className="px-3 py-2 font-medium">آموزشی (T)</th> : null}
    </>
  );
}

function RosterSection({
  title,
  rows,
  result,
  showTrainee,
  span,
}: {
  title: string;
  rows: TimetableRow[];
  result: ProcessResult;
  showTrainee: boolean;
  span: number;
}) {
  return (
    <>
      <tr className="bg-elevated">
        <td colSpan={span * 2} className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {title}
        </td>
      </tr>
      {rows.map((row, idx) => {
        if (!row.golTime && !row.tehTime) {
          return (
            <tr key={`${title}-gap-${idx}`}>
              <td colSpan={span * 2} className="h-2 bg-bg/40" />
            </tr>
          );
        }
        return (
          <tr key={`${title}-${row.golTime}-${row.tehTime}-${idx}`} className="border-t border-border">
            <SlotCells origin="golshahr" time={row.golTime} result={result} showTrainee={showTrainee} />
            <SlotCells origin="tehran" time={row.tehTime} result={result} showTrainee={showTrainee} edge />
          </tr>
        );
      })}
    </>
  );
}

function SlotCells({
  origin,
  time,
  result,
  showTrainee,
  edge,
}: {
  origin: StationKind;
  time: string | null;
  result: ProcessResult;
  showTrainee: boolean;
  edge?: boolean;
}) {
  const slot = slotAt(result.slots, origin, time);
  const edgeClass = edge ? "border-r border-border" : "";
  if (!time) {
    return (
      <>
        <td className={cn("px-3 py-2 text-muted-foreground", edgeClass)}>—</td>
        <td className="px-3 py-2 text-muted-foreground">—</td>
        <td className="px-3 py-2 text-muted-foreground">—</td>
        {showTrainee ? <td className="px-3 py-2 text-muted-foreground">—</td> : null}
      </>
    );
  }
  return (
    <>
      <td className={cn("px-3 py-2 font-medium tabular-nums text-line", edgeClass)}>{time}</td>
      <td className="px-3 py-2">
        <CrewCell people={slot?.masters ?? []} vacant={slot?.vacantMaster} />
      </td>
      <td className="px-3 py-2">
        <CrewCell people={slot?.slaves ?? []} vacant={slot?.vacantSlave} />
      </td>
      {showTrainee ? (
        <td className="px-3 py-2 text-muted-foreground">{crewText(slot?.trainees ?? [])}</td>
      ) : null}
    </>
  );
}

function CrewCell({ people, vacant }: { people: CrewMember[]; vacant?: boolean }) {
  if (vacant) {
    return <span className="text-warn">کسری</span>;
  }
  if (people.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col">
      <span>{crewText(people)}</span>
      {people[0]?.personnelId ? (
        <span className="text-xs tabular-nums text-muted-foreground">{people[0].personnelId}</span>
      ) : null}
    </div>
  );
}

function DriverTable({ rows }: { rows: DriverRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-sm text-muted-foreground">
        نتیجه‌ای نیست.
      </p>
    );
  }
  const max = rows.reduce((m, r) => Math.max(m, r.tripCount), 0);
  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface">
      <table className="w-full min-w-[720px] text-right text-sm">
        <thead className="sticky top-0 z-10 bg-muted text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">نام</th>
            <th className="px-3 py-2 font-medium">نام خانوادگی</th>
            <th className="px-3 py-2 font-medium">شماره پرسنلی</th>
            <th className="px-3 py-2 font-medium">تعداد</th>
            {Array.from({ length: max }, (_, i) => (
              <th key={i} className="px-3 py-2 font-medium">
                حرکت {faNum(i + 1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.personnelId}-${row.lastName}`} className="border-t border-border">
              <td className="px-3 py-2 tabular-nums text-muted-foreground">{faNum(i + 1)}</td>
              <td className="px-3 py-2">{row.firstName}</td>
              <td className="px-3 py-2 font-medium">{row.lastName}</td>
              <td className="px-3 py-2 tabular-nums">{row.personnelId}</td>
              <td className="px-3 py-2">
                <Badge variant={row.unusual ? "warn" : "ok"}>{faNum(row.tripCount)}</Badge>
              </td>
              {Array.from({ length: max }, (_, idx) => {
                const trip = row.trips[idx];
                return (
                  <td key={idx} className="px-3 py-2 tabular-nums">
                    {trip ? (
                      <span title={`${roleLabel(trip.role)} · ${stationLabel(trip.origin)}`}>
                        {trip.time}
                        <span className="ms-1 text-xs text-muted-foreground">{stationShort(trip.origin)}</span>
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailTable({ trips }: { trips: ProcessResult["trips"] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface">
      <table className="w-full min-w-[800px] text-right text-sm">
        <thead className="sticky top-0 z-10 bg-muted text-xs text-muted-foreground">
          <tr>
            {["نوع", "کد", "نام", "نام خانوادگی", "مبدأ", "مقصد", "ساعت"].map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trips.map((t, i) => (
            <tr key={`${t.sourceRow}-${i}`} className="border-t border-border">
              <td className="px-3 py-2">{roleLabel(t.role)}</td>
              <td className="px-3 py-2 tabular-nums">{t.personnelId}</td>
              <td className="px-3 py-2">{t.firstName}</td>
              <td className="px-3 py-2 font-medium">{t.lastName}</td>
              <td className="px-3 py-2">{t.originRaw || stationLabel(t.origin)}</td>
              <td className="px-3 py-2">{t.destRaw || stationLabel(t.dest)}</td>
              <td className="px-3 py-2 tabular-nums text-line">{t.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WarningsPanel({ result }: { result: ProcessResult }) {
  if (result.warnings.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 text-sm text-muted-foreground">
        کسری در ساعت‌های لوحه خروجی نیست. جفت راهبر و کمک‌راهبر کامل است.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {result.warnings.map((w, i) => (
        <li
          key={`${w.code}-${i}`}
          className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-sm"
        >
          <Badge variant={w.level === "error" ? "danger" : w.level === "warn" ? "warn" : "default"}>
            {w.level === "error" ? "خطا" : w.level === "warn" ? "هشدار" : "اطلاع"}
          </Badge>
          <span className="ms-3">{w.message}</span>
        </li>
      ))}
    </ul>
  );
}
