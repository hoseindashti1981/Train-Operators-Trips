import { roleLabel, stationLabel } from "./normalize";
import { appendPrintSheet, buildPrintSheet } from "./print-sheet";
import type { ProcessResult, SlotAssignment } from "./types";
import { loadXlsx, type XLSXModule } from "./xlsx-load";

function slotAt(slots: SlotAssignment[], origin: SlotAssignment["origin"], time: string | null): SlotAssignment | null {
  if (!time) return null;
  return slots.find((s) => s.origin === origin && s.time === time) ?? null;
}

function names(slot: SlotAssignment | null, kind: "masters" | "slaves" | "trainees"): string {
  if (!slot) return "";
  return slot[kind].map((p) => p.displayName).join(" / ");
}

function ids(slot: SlotAssignment | null, kind: "masters" | "slaves"): string {
  if (!slot) return "";
  return slot[kind]
    .map((p) => p.personnelId)
    .filter(Boolean)
    .join(" / ");
}

export async function buildExportWorkbook(result: ProcessResult) {
  const XLSX = await loadXlsx();
  const wb = XLSX.utils.book_new();
  const rows = result.timetableRows;

  const pardazesh: (string | number)[][] = [
    [
      "زمان حرکت گلشهر",
      "راهبر (H1 / مستر)",
      "کمک‌راهبر (R / اسلیو)",
      "راهبر آموزشی (T)",
      "کد راهبر",
      "کد کمک",
      "",
      "زمان حرکت تهران",
      "راهبر (H1 / مستر)",
      "کمک‌راهبر (R / اسلیو)",
      "راهبر آموزشی (T)",
      "کد راهبر",
      "کد کمک",
    ],
  ];

  for (const row of rows) {
    const gol = slotAt(result.slots, "golshahr", row.golTime);
    const teh = slotAt(result.slots, "tehran", row.tehTime);
    if (!row.golTime && !row.tehTime) {
      pardazesh.push([]);
      continue;
    }
    pardazesh.push([
      row.golTime ?? "",
      names(gol, "masters"),
      names(gol, "slaves"),
      names(gol, "trainees"),
      ids(gol, "masters"),
      ids(gol, "slaves"),
      "",
      row.tehTime ?? "",
      names(teh, "masters"),
      names(teh, "slaves"),
      names(teh, "trainees"),
      ids(teh, "masters"),
      ids(teh, "slaves"),
    ]);
  }

  const maxTrips = result.drivers.reduce((m, d) => Math.max(m, d.tripCount), 0);
  const hourCols = Math.max(maxTrips, 2);
  const driverHeader = ["نام", "نام خانوادگی", "شماره پرسنلی", "تعداد حرکت"];
  for (let i = 1; i <= hourCols; i++) driverHeader.push(`حرکت ${i}`);
  const driverAoA: (string | number)[][] = [
    [`گزارش راهبران — مرتب‌سازی فامیلی — ${result.meta.processDate || result.meta.fileName}`],
    driverHeader,
  ];
  for (const d of result.drivers) {
    const line: (string | number)[] = [d.firstName, d.lastName, d.personnelId, d.tripCount];
    for (let i = 0; i < hourCols; i++) {
      const t = d.trips[i];
      line.push(t ? t.time : "");
    }
    driverAoA.push(line);
  }

  const detail: (string | number)[][] = [
    ["نوع اعزام", "کد پرسنلی", "نام", "نام خانوادگی", "مبدأ", "مقصد", "زمان حرکت", "تاریخ"],
  ];
  for (const t of result.trips) {
    if (t.role !== "master" && t.role !== "slave" && t.role !== "trainee") continue;
    detail.push([
      t.roleRaw || roleLabel(t.role),
      t.personnelId,
      t.firstName,
      t.lastName,
      t.originRaw || stationLabel(t.origin),
      t.destRaw || stationLabel(t.dest),
      t.time,
      t.date,
    ]);
  }

  const warnAoA: (string | number)[][] = [["سطح", "کد", "پیام"]];
  for (const w of result.warnings) {
    warnAoA.push([w.level, w.code, w.message]);
  }
  if (result.warnings.length === 0) warnAoA.push(["info", "ok", "هشداری ثبت نشد."]);

  const s1 = XLSX.utils.aoa_to_sheet(pardazesh);
  const s2 = XLSX.utils.aoa_to_sheet(driverAoA);
  const s3 = XLSX.utils.aoa_to_sheet(detail);
  const s4 = XLSX.utils.aoa_to_sheet(warnAoA);

  s1["!cols"] = Array.from({ length: 13 }, () => ({ wch: 22 }));
  s2["!cols"] = [
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    ...Array.from({ length: hourCols }, () => ({ wch: 10 })),
  ];
  s3["!cols"] = [
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 14 },
  ];
  s4["!cols"] = [{ wch: 10 }, { wch: 16 }, { wch: 70 }];

  freeze(s1);
  freeze(s2, 2);
  freeze(s3);
  freeze(s4);
  rtlBook(XLSX, wb);

  XLSX.utils.book_append_sheet(wb, s1, "پردازش");
  XLSX.utils.book_append_sheet(wb, s2, "گزارش راهبران");
  XLSX.utils.book_append_sheet(wb, s3, "جزئیات اعزام");
  XLSX.utils.book_append_sheet(wb, s4, "هشدارها");
  await appendPrintSheet(wb, buildPrintSheet(result));
  return wb;
}

function freeze(sheet: Record<string, unknown>, ySplit = 1) {
  sheet["!views"] = [{ state: "frozen", xSplit: 0, ySplit, topLeftCell: `A${ySplit + 1}`, activeCell: `A${ySplit + 1}` }];
}

function rtlBook(XLSX: XLSXModule, wb: ReturnType<XLSXModule["utils"]["book_new"]>) {
  wb.Workbook = wb.Workbook || {};
  wb.Workbook.Views = [{ RTL: true }];
  void XLSX;
}

export async function downloadWorkbook(result: ProcessResult): Promise<void> {
  const XLSX = await loadXlsx();
  const wb = await buildExportWorkbook(result);
  const date = (result.meta.processDate || "export").replace(/\//g, "-");
  XLSX.writeFile(wb, `lohe-pardazesh-${date}.xlsx`);
}
