import {
  formatJalali,
  jalaliAddDays,
  jalaliDiffDays,
  jalaliMonthLength,
  jalaliToUtc,
  parseJalaliDate,
  weekdayNameOf,
  type JalaliDate,
} from "./jalali";
import type { ShiftDuty, ShiftLetter } from "./personnel";

/** مبدأ ابدی تقویم شیفت — ۱۴۰۵/۰۷/۰۷ روز ۱، صبح B، عصر A، استراحت C */
export const SHIFT_ANCHOR: JalaliDate = { jy: 1405, jm: 7, jd: 7 };

export const SHIFT_BLOCKS: { morning: ShiftLetter; evening: ShiftLetter; rest: ShiftLetter }[] = [
  { morning: "B", evening: "A", rest: "C" },
  { morning: "A", evening: "C", rest: "B" },
  { morning: "C", evening: "B", rest: "A" },
];

export interface DayShift {
  jy: number;
  jm: number;
  jd: number;
  iso: string;
  weekdayName: string;
  cycleIndex: number;
  blockDay: 1 | 2;
  morning: ShiftLetter;
  evening: ShiftLetter;
  rest: ShiftLetter;
  /** ۱۲ ساعتهٔ صبح‌زود (شبِ قبل یا همان شب) */
  early12: ShiftLetter;
  day12: ShiftLetter;
  night12: ShiftLetter;
  groups12: 2 | 3;
}

export function cycleIndexOf(j: JalaliDate): number {
  const diff = jalaliDiffDays(j, SHIFT_ANCHOR);
  return ((diff % 6) + 6) % 6;
}

export function dayShiftOn(j: JalaliDate): DayShift {
  const cycleIndex = cycleIndexOf(j);
  const blockIndex = Math.floor(cycleIndex / 2);
  const blockDay = (cycleIndex % 2 === 0 ? 1 : 2) as 1 | 2;
  const block = SHIFT_BLOCKS[blockIndex]!;
  const prev = SHIFT_BLOCKS[(blockIndex + 2) % 3]!;
  const early12 = blockDay === 1 ? prev.evening : block.evening;
  return {
    ...j,
    iso: formatJalali(j),
    weekdayName: weekdayNameOf(j),
    cycleIndex,
    blockDay,
    morning: block.morning,
    evening: block.evening,
    rest: block.rest,
    early12,
    day12: block.morning,
    night12: block.evening,
    groups12: early12 === block.evening ? 2 : 3,
  };
}

export function dayShiftFromJalaliString(raw: string | null | undefined): DayShift | null {
  if (!raw) return null;
  const parsed = parseJalaliDate(raw);
  if (!parsed) return null;
  return dayShiftOn(parsed);
}

export function dutyFromDayShift(day: DayShift): ShiftDuty {
  return { morning: day.morning, evening: day.evening };
}

export function monthGrid(jy: number, jm: number): (DayShift | null)[] {
  const len = jalaliMonthLength(jy, jm);
  const jsDay = jalaliToUtc({ jy, jm, jd: 1 }).getUTCDay();
  const satIndex = (jsDay + 1) % 7;
  const cells: (DayShift | null)[] = Array.from({ length: satIndex }, () => null);
  for (let d = 1; d <= len; d++) cells.push(dayShiftOn({ jy, jm, jd: d }));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function addJalaliMonth(jy: number, jm: number, delta: number): { jy: number; jm: number } {
  const abs = jy * 12 + (jm - 1) + delta;
  return { jy: Math.floor(abs / 12), jm: (abs % 12) + 1 };
}

export function nextSixDays(from: JalaliDate): DayShift[] {
  return Array.from({ length: 6 }, (_, i) => dayShiftOn(jalaliAddDays(from, i)));
}
