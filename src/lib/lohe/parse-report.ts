import {
  classifyRole,
  classifyStation,
  compactFa,
  normalizeFa,
  parseTimeToMinutes,
} from "./normalize";
import type { ParseMeta, Trip } from "./types";
import { loadXlsx } from "./xlsx-load";

interface HeaderMap {
  role: number;
  id: number;
  first: number;
  last: number;
  dest: number;
  origin: number;
  time: number;
  date: number;
}

function cellText(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return "";
  if (typeof value === "number") return String(value);
  return String(value);
}

function scoreHeaderCell(text: string): keyof HeaderMap | null {
  const n = compactFa(text);
  if (!n) return null;
  if (n.includes("نوعاعزام") || n === "نوع") return "role";
  if (n.includes("کدپرسنل") || n.includes("شمارهپرسنل") || n === "کد") return "id";
  if (n.includes("نامخانوادگ") || n.includes("فامیل")) return "last";
  if (n.includes("نامراهبر") || n === "نام") return "first";
  if (n.includes("ایستگاهمقصد") || n === "مقصد") return "dest";
  if (n.includes("ایستگاهمبدا") || n.includes("ایستگاهمبدأ") || n === "مبدا" || n === "مبدأ") return "origin";
  if (n.includes("زمانحرکت") || n.includes("زمانحزکت") || n === "ساعت") return "time";
  if (n.includes("تاریخپردازش") || (n.includes("تاریخ") && n.includes("پردازش"))) return "date";
  return null;
}

function detectHeaders(rows: unknown[][]): { map: HeaderMap; headerRow: number } | null {
  for (let r = 0; r < Math.min(rows.length, 25); r++) {
    const row = rows[r] ?? [];
    const found: Partial<HeaderMap> = {};
    row.forEach((cell, c) => {
      const key = scoreHeaderCell(cellText(cell));
      if (key && found[key] == null) found[key] = c;
    });
    if (found.role != null && found.time != null && (found.first != null || found.last != null)) {
      return {
        headerRow: r,
        map: {
          role: found.role,
          id: found.id ?? -1,
          first: found.first ?? -1,
          last: found.last ?? -1,
          dest: found.dest ?? -1,
          origin: found.origin ?? -1,
          time: found.time,
          date: found.date ?? -1,
        },
      };
    }
  }
  return null;
}

function personnelId(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.round(value));
  }
  const text = normalizeFa(String(value));
  return text.replace(/\.0$/, "");
}

function pickMeta(rows: unknown[][]): Pick<ParseMeta, "reportDate" | "processDate" | "userName" | "line" | "title"> {
  const blob = rows
    .slice(0, 6)
    .flat()
    .map((c) => cellText(c))
    .filter(Boolean);
  let reportDate = "";
  let processDate = "";
  let userName = "";
  let line = "";
  let title = "";
  for (let i = 0; i < blob.length; i++) {
    const t = normalizeFa(blob[i] ?? "");
    if (t.includes("تاریخ اخذ گزارش") && blob[i - 1]) reportDate = normalizeFa(blob[i - 1] ?? "");
    if (t.includes("نام کاربر") && blob[i - 1]) userName = normalizeFa(blob[i - 1] ?? "");
    if (t.includes("لوحه اعزام")) title = t;
    if (t === "خط" && blob[i - 1]) line = normalizeFa(blob[i - 1] ?? "");
  }
  return { reportDate, processDate, userName, line, title };
}

function extractTrips(rows: unknown[][], map: HeaderMap, headerRow: number): Trip[] {
  const trips: Trip[] = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const roleRaw = normalizeFa(cellText(row[map.role]));
    const timeRaw = map.time >= 0 ? row[map.time] : "";
    const parsedTime = parseTimeToMinutes(timeRaw);
    if (!parsedTime) continue;
    if (!roleRaw && !personnelId(map.id >= 0 ? row[map.id] : "")) continue;

    const firstName = map.first >= 0 ? normalizeFa(cellText(row[map.first])) : "";
    const lastName = map.last >= 0 ? normalizeFa(cellText(row[map.last])) : "";
    const originRaw = map.origin >= 0 ? normalizeFa(cellText(row[map.origin])) : "";
    const destRaw = map.dest >= 0 ? normalizeFa(cellText(row[map.dest])) : "";
    const date = map.date >= 0 ? normalizeFa(cellText(row[map.date])) : "";
    const role = classifyRole(roleRaw);
    if (role === "other" && !firstName && !lastName) continue;

    trips.push({
      role,
      roleRaw,
      personnelId: map.id >= 0 ? personnelId(row[map.id]) : "",
      firstName,
      lastName,
      origin: classifyStation(originRaw),
      originRaw,
      dest: classifyStation(destRaw),
      destRaw,
      time: parsedTime.time,
      minutes: parsedTime.minutes,
      date,
      sourceRow: r + 1,
    });
  }
  return trips;
}

function namedCrewCount(trips: Trip[]): number {
  return trips.filter(
    (t) => (t.role === "master" || t.role === "slave") && (t.firstName || t.lastName),
  ).length;
}

export async function parseWorkbook(
  data: ArrayBuffer | Uint8Array,
  fileName: string,
): Promise<{ trips: Trip[]; meta: ParseMeta }> {
  const XLSX = await loadXlsx();
  // cellDates:false keeps Excel times as day-fractions — timezone-safe.
  const wb = XLSX.read(data, { type: "array", cellDates: false, raw: true });

  let best: {
    sheetName: string;
    trips: Trip[];
    metaBits: ReturnType<typeof pickMeta>;
    score: number;
  } | null = null;

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: true,
      defval: "",
      blankrows: false,
    }) as unknown[][];
    const headers = detectHeaders(rows);
    if (!headers) continue;
    const trips = extractTrips(rows, headers.map, headers.headerRow);
    const score = namedCrewCount(trips);
    if (!best || score > best.score) {
      best = { sheetName, trips, metaBits: pickMeta(rows), score };
    }
  }

  if (!best || best.trips.length === 0) {
    throw new Error(
      "ساختار گزارش اولیه شناخته نشد. ستون‌های نوع اعزام، نام و زمان حرکت باید در فایل باشند.",
    );
  }

  if (best.score === 0) {
    throw new Error(
      "در این فایل اعزام راهبر یا کمک‌راهبر با نام پیدا نشد. فایل «اولیه» روزانه را بارگذاری کنید، نه لوحه خالی.",
    );
  }

  const processDate = best.trips.find((t) => t.date)?.date ?? best.metaBits.processDate;

  return {
    trips: best.trips,
    meta: {
      fileName,
      reportDate: best.metaBits.reportDate,
      processDate,
      userName: best.metaBits.userName,
      line: best.metaBits.line,
      title: best.metaBits.title || "لوحه اعزام",
      sheetName: best.sheetName,
      rowCount: best.trips.length,
    },
  };
}
