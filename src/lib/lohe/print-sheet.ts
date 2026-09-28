import type { KasriResult } from "./kasri";
import type { ShiftDuty } from "./personnel";
import { DEFAULT_DUTY } from "./personnel";
import type { CrewMember, ProcessResult, SlotAssignment } from "./types";
import { loadXlsx, type XLSXModule } from "./xlsx-load";

export const FIXED_MORNING_SHIFT = DEFAULT_DUTY.morning;
export const FIXED_EVENING_SHIFT = DEFAULT_DUTY.evening;

export interface PrintRow {
  golTime: string;
  golR: string;
  golT: string;
  golH1: string;
  tehTime: string;
  tehR: string;
  tehH1: string;
}

export interface PrintSheet {
  morningShift: string;
  eveningShift: string;
  date: string;
  weekday: string;
  rows: PrintRow[];
  morningShortage: string[];
  eveningShortage: string[];
  overtimeNames: string[];
}

function slotAt(slots: SlotAssignment[], origin: SlotAssignment["origin"], time: string): SlotAssignment | null {
  if (!time) return null;
  return slots.find((s) => s.origin === origin && s.time === time) ?? null;
}

function names(people: CrewMember[]): string {
  return people.map((p) => p.displayName).filter(Boolean).join(" / ");
}

export function buildPrintSheet(
  result: ProcessResult,
  opts?: { duty?: ShiftDuty; kasri?: KasriResult | null },
): PrintSheet {
  const duty = opts?.duty ?? opts?.kasri?.duty ?? DEFAULT_DUTY;
  const kasri = opts?.kasri;
  return {
    morningShift: duty.morning,
    eveningShift: duty.evening,
    date: result.meta.processDate || result.meta.reportDate || "",
    weekday: result.weekdayName,
    rows: result.timetableRows.map((row) => {
      const gol = slotAt(result.slots, "golshahr", row.golTime ?? "");
      const teh = slotAt(result.slots, "tehran", row.tehTime ?? "");
      return {
        golTime: row.golTime ?? "",
        golR: names(gol?.slaves ?? []),
        golT: names(gol?.trainees ?? []),
        golH1: names(gol?.masters ?? []),
        tehTime: row.tehTime ?? "",
        tehR: names(teh?.slaves ?? []),
        tehH1: names(teh?.masters ?? []),
      };
    }),
    morningShortage: kasri?.morningMissing.map((p) => p.displayName) ?? [],
    eveningShortage: kasri?.eveningMissing.map((p) => p.displayName) ?? [],
    overtimeNames: kasri?.overtime.map((p) => p.displayName) ?? [],
  };
}

export function shortageLabel(kind: "morning" | "evening", letter: string): string {
  const when = kind === "morning" ? "صبحکار" : "عصرکار";
  return `شیفت (${letter}) ${when}***کسری شیفت!!!`;
}

export function buildPrintAoA(sheet: PrintSheet): (string | number)[][] {
  const aoa: (string | number)[][] = [
    ["شیفت صبح", sheet.morningShift, "", "", "شیفت عصر", sheet.eveningShift, "", ""],
    ["", "گلشهر", "", "", sheet.date ? `تاریخ ${sheet.date}` : "تاریخ", "تهران - صادقیه", "", ""],
    ["زمان حرکت", "R", "T", "H1", "زمان حرکت", "R", sheet.weekday || "روز هفته", "H1"],
  ];
  for (const row of sheet.rows) {
    aoa.push([row.golTime, row.golR, row.golT, row.golH1, row.tehTime, row.tehR, "", row.tehH1]);
  }
  const footerRows = Math.max(16, sheet.morningShortage.length + 1, sheet.eveningShortage.length + 1);
  aoa.push([
    "",
    "نام",
    shortageLabel("evening", sheet.eveningShift),
    "نام",
    shortageLabel("morning", sheet.morningShift),
    "نام",
    shortageLabel("evening", sheet.eveningShift),
    "نام",
  ]);
  for (let i = 0; i < footerRows - 1; i++) {
    const morning = sheet.morningShortage[i] ?? "";
    const evening = sheet.eveningShortage[i] ?? "";
    aoa.push(["", evening, "", morning, "", "", "", ""]);
  }
  return aoa;
}

export function printMerges(dataRowCount: number, footerRowCount = 16): { s: { r: number; c: number }; e: { r: number; c: number } }[] {
  const footer = 3 + dataRowCount;
  const footerEnd = footer + footerRowCount - 1;
  return [
    { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } },
    { s: { r: 1, c: 5 }, e: { r: 1, c: 7 } },
    { s: { r: footer, c: 0 }, e: { r: footerEnd, c: 0 } },
    { s: { r: footer, c: 2 }, e: { r: footerEnd, c: 2 } },
    { s: { r: footer, c: 4 }, e: { r: footerEnd, c: 4 } },
    { s: { r: footer, c: 6 }, e: { r: footerEnd, c: 6 } },
  ];
}

export async function appendPrintSheet(wb: ReturnType<XLSXModule["utils"]["book_new"]>, sheet: PrintSheet) {
  const XLSX = await loadXlsx();
  const aoa = buildPrintAoA(sheet);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = printMerges(
    sheet.rows.length,
    Math.max(16, sheet.morningShortage.length + 1, sheet.eveningShortage.length + 1),
  );
  ws["!cols"] = [
    { wch: 10 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
  ];
  ws["!views"] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(wb, ws, "لوحه چاپ");
}

export async function downloadPrintWorkbook(sheet: PrintSheet): Promise<void> {
  const XLSX = await loadXlsx();
  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: true }] };
  await appendPrintSheet(wb, sheet);
  const date = (sheet.date || "xxxx-xx-xx").replace(/\//g, "-");
  XLSX.writeFile(wb, `لوحه اعزام تاریخ ${date}.xlsx`);
}
