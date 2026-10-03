import type { DayKind } from "./types";

export const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"] as const;
export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

/** Jalali → Gregorian (jalaali-js algorithm). */
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    div(jy, 33) * 8 +
    div((jy % 33) + 3, 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const salA = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 1; gm <= 12 && gd > salA[gm]; gm++) gd -= salA[gm];
  return [gy, gm, gd];
}

/** Gregorian → Jalali (jalaali-js algorithm). */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

export function parseJalaliDate(raw: string): JalaliDate | null {
  const m = String(raw ?? "").trim().match(/(\d{3,4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (!m) return null;
  const jy = Number(m[1]);
  const jm = Number(m[2]);
  const jd = Number(m[3]);
  if (jy < 1200 || jy > 1600 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
  return { jy, jm, jd };
}

export function formatJalali(j: JalaliDate): string {
  return `${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(2, "0")}`;
}

export function jalaliToUtc(j: JalaliDate): Date {
  const [gy, gm, gd] = jalaliToGregorian(j.jy, j.jm, j.jd);
  return new Date(Date.UTC(gy, gm - 1, gd));
}

export function jalaliFromUtc(date: Date): JalaliDate {
  return gregorianToJalali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function jalaliToday(): JalaliDate {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function jalaliAddDays(j: JalaliDate, days: number): JalaliDate {
  const utc = jalaliToUtc(j);
  utc.setUTCDate(utc.getUTCDate() + days);
  return jalaliFromUtc(utc);
}

export function jalaliDiffDays(a: JalaliDate, b: JalaliDate): number {
  return Math.round((jalaliToUtc(a).getTime() - jalaliToUtc(b).getTime()) / 86400000);
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const next = jalaliAddDays({ jy, jm, jd: 29 }, 1);
  return next.jm === 12 ? 30 : 29;
}

export function weekdayFromJalali(raw: string): { name: string; dayKind: DayKind; jsDay: number } | null {
  const parsed = parseJalaliDate(raw);
  if (!parsed) return null;
  const date = jalaliToUtc(parsed);
  const jsDay = date.getUTCDay();
  const name = WEEKDAYS[jsDay] ?? "نامشخص";
  let dayKind: DayKind = "weekday";
  if (jsDay === 4) dayKind = "thursday";
  if (jsDay === 5) dayKind = "friday";
  return { name, dayKind, jsDay };
}

export function weekdayNameOf(j: JalaliDate): string {
  return WEEKDAYS[jalaliToUtc(j).getUTCDay()] ?? "نامشخص";
}

export function dayKindLabel(kind: DayKind): string {
  if (kind === "thursday") return "پنجشنبه";
  if (kind === "friday") return "جمعه";
  return "روز عادی";
}
