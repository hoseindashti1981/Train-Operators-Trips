import type { CrewMember, ProcessResult, SlotAssignment } from "./types";
import { loadXlsx, type XLSXModule } from "./xlsx-load";

/** تا وقتی تقویم شیفت تاریخ ساخته شود، صبح = A و عصر = B */
export const FIXED_MORNING_SHIFT = "A";
export const FIXED_EVENING_SHIFT = "B";

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
}

function slotAt(slots: SlotAssignment[], origin: SlotAssignment["origin"], time: string): SlotAssignment | null {
  if (!time) return null;
  return slots.find((s) => s.origin === origin && s.time === time) ?? null;
}

function names(people: CrewMember[]): string {
  return people.map((p) => p.displayName).filter(Boolean).join(" / ");
}

export function buildPrintSheet(result: ProcessResult): PrintSheet {
  return {
    morningShift: FIXED_MORNING_SHIFT,
    eveningShift: FIXED_EVENING_SHIFT,
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
  for (let i = 1; i < 16; i++) aoa.push(["", "", "", "", "", "", "", ""]);
  return aoa;
}

export function printMerges(dataRowCount: number): { s: { r: number; c: number }; e: { r: number; c: number } }[] {
  const footer = 3 + dataRowCount;
  const footerEnd = footer + 15;
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
  ws["!merges"] = printMerges(sheet.rows.length);
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
