import { cloneDefaultBook, DEFAULT_PAIRS, normalizeHourInput } from "./templates";
import type { DayKind, TimePair, TimetableBook } from "./types";

const STORAGE_KEY = "lohe-output-hours-v1";

function asPair(value: unknown): TimePair | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const gol = value[0] == null || value[0] === "" ? null : normalizeHourInput(String(value[0]));
  const teh = value[1] == null || value[1] === "" ? null : normalizeHourInput(String(value[1]));
  return [gol, teh];
}

function asKindList(value: unknown, fallback: TimePair[]): TimePair[] {
  if (!Array.isArray(value) || value.length === 0) return fallback.map((p) => [...p] as TimePair);
  const rows: TimePair[] = [];
  for (const item of value) {
    const pair = asPair(item);
    if (pair) rows.push(pair);
  }
  return rows.length > 0 ? rows : fallback.map((p) => [...p] as TimePair);
}

export function sanitizeBook(raw: unknown): TimetableBook {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    weekday: asKindList(src.weekday, DEFAULT_PAIRS.weekday),
    thursday: asKindList(src.thursday, DEFAULT_PAIRS.thursday),
    friday: asKindList(src.friday, DEFAULT_PAIRS.friday),
  };
}

export function loadTimetableBook(): TimetableBook {
  if (typeof localStorage === "undefined") return cloneDefaultBook();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultBook();
    return sanitizeBook(JSON.parse(raw));
  } catch {
    return cloneDefaultBook();
  }
}

export function saveTimetableBook(book: TimetableBook): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
  } catch {
    /* quota / private mode */
  }
}

export function resetTimetableBook(kind?: DayKind): TimetableBook {
  const next = loadTimetableBook();
  if (kind) {
    next[kind] = DEFAULT_PAIRS[kind].map((p) => [...p] as TimePair);
  } else {
    return cloneDefaultBook();
  }
  saveTimetableBook(next);
  return next;
}
