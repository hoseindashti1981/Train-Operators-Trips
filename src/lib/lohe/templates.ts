import { parseTimeToMinutes } from "./normalize";
import type { DayKind, TimePair, TimetableBook, TimetableRow } from "./types";

export function rowsFrom(pairs: TimePair[]): TimetableRow[] {
  return pairs.map(([golTime, tehTime]) => {
    const sample = golTime ?? tehTime ?? "12:00";
    const hour = Number(sample.slice(0, 2));
    let section: TimetableRow["section"] = "morning";
    if (hour >= 12 && hour < 19) section = "midday";
    else if (hour >= 19 || hour < 4) section = "evening";
    return { golTime, tehTime, section };
  });
}

/** ساعت‌های شیت خروجی — روز عادی (شنبه تا چهارشنبه) */
const WEEKDAY: TimePair[] = [
  ["05:20", "05:30"],
  ["05:30", "06:00"],
  ["05:40", "06:10"],
  ["05:50", "06:30"],
  ["06:00", null],
  ["06:10", null],
  ["06:20", null],
  ["06:30", null],
  ["06:50", null],
  ["07:00", null],
  ["07:20", "07:40"],
  ["07:30", null],
  [null, null],
  ["07:40", null],
  ["08:00", null],
  ["08:10", "08:30"],
  ["08:30", null],
  [null, null],
  ["13:00", null],
  ["13:15", null],
  ["13:30", "13:30"],
  ["13:45", null],
  ["13:55", null],
  ["14:15", null],
  ["14:25", "14:30"],
  ["14:35", "14:50"],
  ["14:55", null],
  ["15:15", "16:00"],
  ["15:25", "17:40"],
  ["15:35", null],
  ["15:55", "19:40"],
  [null, null],
  ["20:00", null],
  ["20:15", "20:45"],
  ["20:30", "21:20"],
  [null, "21:40"],
  ["22:00", "22:00"],
];

const THURSDAY: TimePair[] = [
  ["05:20", "05:30"],
  ["05:30", "06:00"],
  ["05:40", "06:10"],
  ["05:50", "06:30"],
  ["06:00", null],
  ["06:10", null],
  ["06:20", null],
  ["06:30", null],
  ["06:50", null],
  ["07:00", null],
  ["07:10", null],
  ["07:30", "07:30"],
  ["08:00", null],
  [null, null],
  ["08:10", "08:20"],
  ["08:20", null],
  ["08:30", null],
  [null, null],
  [null, null],
  ["13:25", null],
  ["13:35", "13:15"],
  ["13:45", null],
  ["14:05", "13:50"],
  ["14:15", null],
  ["14:25", null],
  ["14:35", "14:20"],
  ["14:45", null],
  ["14:55", null],
  ["15:15", "15:10"],
  ["16:15", null],
  ["16:35", "16:50"],
  [null, null],
  [null, null],
  ["20:00", "20:15"],
  ["20:15", "21:20"],
  ["20:30", "21:40"],
  ["22:00", "22:00"],
];

const FRIDAY: TimePair[] = [
  ["06:00", "06:15"],
  ["06:30", "06:45"],
  ["07:00", "07:15"],
  ["07:30", "07:45"],
  ["08:00", "08:15"],
  ["08:30", "08:45"],
  ["09:00", "09:15"],
  ["09:30", "09:45"],
  ["10:00", "10:15"],
  ["10:30", "10:45"],
  ["11:00", "11:15"],
  ["11:30", "11:45"],
  ["12:00", "12:15"],
  ["12:30", "12:45"],
  ["13:00", "13:15"],
  ["13:30", "13:45"],
  ["14:00", "14:15"],
  ["14:30", "14:45"],
  ["15:00", "15:10"],
  ["15:20", "15:30"],
  ["15:40", "15:50"],
  ["16:00", "16:10"],
  ["16:20", "16:30"],
  ["16:40", "16:50"],
  ["17:00", "17:10"],
  ["17:20", "17:30"],
  ["17:40", "17:50"],
  ["18:00", "18:10"],
  ["18:20", "18:30"],
  ["18:40", "18:50"],
  ["19:00", "19:10"],
  ["19:30", "19:30"],
  ["20:00", "20:00"],
  ["20:30", "20:30"],
  ["21:00", "21:00"],
  ["21:30", "21:30"],
  ["22:00", "22:00"],
];

export const DEFAULT_PAIRS: TimetableBook = {
  weekday: WEEKDAY,
  thursday: THURSDAY,
  friday: FRIDAY,
};

export const TIMETABLES: Record<DayKind, TimetableRow[]> = {
  weekday: rowsFrom(WEEKDAY),
  thursday: rowsFrom(THURSDAY),
  friday: rowsFrom(FRIDAY),
};

export function cloneDefaultBook(): TimetableBook {
  return {
    weekday: WEEKDAY.map((p) => [...p] as TimePair),
    thursday: THURSDAY.map((p) => [...p] as TimePair),
    friday: FRIDAY.map((p) => [...p] as TimePair),
  };
}

export function pairsEqual(a: TimePair[], b: TimePair[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, i) => row[0] === b[i]?.[0] && row[1] === b[i]?.[1]);
}

export function bookIsCustom(book: TimetableBook): boolean {
  return (Object.keys(DEFAULT_PAIRS) as DayKind[]).some((k) => !pairsEqual(book[k], DEFAULT_PAIRS[k]));
}

export function normalizeHourInput(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  return parseTimeToMinutes(t)?.time ?? null;
}

export function getTimetable(kind: DayKind, book?: TimetableBook | null): TimetableRow[] {
  if (book?.[kind]) return rowsFrom(book[kind]);
  return TIMETABLES[kind];
}

export function countHours(pairs: TimePair[]): { gol: number; teh: number } {
  return {
    gol: pairs.filter((p) => p[0]).length,
    teh: pairs.filter((p) => p[1]).length,
  };
}
