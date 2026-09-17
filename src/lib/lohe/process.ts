import { buildDriverReport } from "./driver-report";
import { dayKindLabel, weekdayFromJalali } from "./jalali";
import { collectWarnings, matchSlots } from "./match";
import { faNum } from "./normalize";
import { parseWorkbook } from "./parse-report";
import type { DayKind, ProcessResult, TimetableBook } from "./types";

export function processTrips(
  trips: ProcessResult["trips"],
  meta: ProcessResult["meta"],
  dayKindOverride?: DayKind | "auto",
  book?: TimetableBook | null,
): ProcessResult {
  const weekday = meta.processDate ? weekdayFromJalali(meta.processDate) : null;
  const detected = weekday?.dayKind ?? "weekday";
  const dayKind = !dayKindOverride || dayKindOverride === "auto" ? detected : dayKindOverride;
  const { slots, rows } = matchSlots(trips, dayKind, book);
  const drivers = buildDriverReport(trips);
  const warnings = collectWarnings(trips, slots);

  const namedTripCount = trips.filter(
    (t) => (t.role === "master" || t.role === "slave") && (t.firstName || t.lastName),
  ).length;
  const filledCrewPairs = slots.filter((s) => !s.vacantMaster && !s.vacantSlave).length;
  const vacantSlots = slots.filter((s) => s.vacantMaster || s.vacantSlave).length;
  const traineeCount = trips.filter((t) => t.role === "trainee").length;

  if (drivers.some((d) => d.unusual)) {
    const odd = drivers.filter((d) => d.unusual);
    warnings.push({
      level: "info",
      code: "unusual-count",
      message: `${faNum(odd.length)} راهبر تعداد حرکت غیرمعمول دارند (کمتر از ۲ یا بیشتر از ۸).`,
    });
  }

  return {
    meta,
    trips,
    dayKind,
    weekdayName: weekday?.name ?? dayKindLabel(dayKind),
    timetableRows: rows,
    slots,
    drivers,
    warnings,
    stats: {
      tripCount: trips.length,
      namedTripCount,
      driverCount: drivers.length,
      filledCrewPairs,
      vacantSlots,
      traineeCount,
    },
  };
}

export async function processWorkbook(
  data: ArrayBuffer | Uint8Array,
  fileName: string,
  dayKindOverride?: DayKind | "auto",
  book?: TimetableBook | null,
): Promise<ProcessResult> {
  const { trips, meta } = await parseWorkbook(data, fileName);
  return processTrips(trips, meta, dayKindOverride, book);
}
