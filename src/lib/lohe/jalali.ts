import type { DayKind } from "./types";

const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"] as const;

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

export function parseJalaliDate(raw: string): { jy: number; jm: number; jd: number } | null {
  const m = String(raw ?? "").trim().match(/(\d{3,4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (!m) return null;
  const jy = Number(m[1]);
  const jm = Number(m[2]);
  const jd = Number(m[3]);
  if (jy < 1200 || jy > 1600 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
  return { jy, jm, jd };
}

export function weekdayFromJalali(raw: string): { name: string; dayKind: DayKind; jsDay: number } | null {
  const parsed = parseJalaliDate(raw);
  if (!parsed) return null;
  const [gy, gm, gd] = jalaliToGregorian(parsed.jy, parsed.jm, parsed.jd);
  const date = new Date(Date.UTC(gy, gm - 1, gd));
  const jsDay = date.getUTCDay();
  const name = WEEKDAYS[jsDay] ?? "نامشخص";
  let dayKind: DayKind = "weekday";
  if (jsDay === 4) dayKind = "thursday";
  if (jsDay === 5) dayKind = "friday";
  return { name, dayKind, jsDay };
}

export function dayKindLabel(kind: DayKind): string {
  if (kind === "thursday") return "پنجشنبه";
  if (kind === "friday") return "جمعه";
  return "روز عادی";
}
