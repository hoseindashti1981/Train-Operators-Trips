import { displayName, oppositeStation } from "./normalize";
import { getTimetable } from "./templates";
import type {
  CrewMember,
  DayKind,
  RoleKind,
  SlotAssignment,
  StationKind,
  TimetableBook,
  TimetableRow,
  Trip,
  WarningItem,
} from "./types";

function toCrew(trip: Trip): CrewMember {
  return {
    personnelId: trip.personnelId,
    firstName: trip.firstName,
    lastName: trip.lastName,
    role: trip.role,
    displayName: displayName(trip.lastName, trip.firstName),
  };
}

function hasName(trip: Trip): boolean {
  return Boolean(trip.firstName || trip.lastName);
}

function pick(trips: Trip[], origin: StationKind, time: string, role: RoleKind): CrewMember[] {
  return trips
    .filter((t) => t.origin === origin && t.time === time && t.role === role && hasName(t))
    .map(toCrew);
}

function assignSlot(trips: Trip[], origin: StationKind, time: string): SlotAssignment {
  const dest = oppositeStation(origin);
  const masters = pick(trips, origin, time, "master");
  const slaves = pick(trips, origin, time, "slave");
  const trainees = pick(trips, origin, time, "trainee");
  const emptyNamed = trips.some(
    (t) => t.origin === origin && t.time === time && !hasName(t) && (t.role === "master" || t.role === "slave"),
  );
  return {
    time,
    origin,
    dest,
    masters,
    slaves,
    trainees,
    vacantMaster: masters.length === 0,
    vacantSlave: slaves.length === 0,
    emptyNamed,
  };
}

export function matchSlots(
  trips: Trip[],
  dayKind: DayKind,
  book?: TimetableBook | null,
): {
  slots: SlotAssignment[];
  rows: TimetableRow[];
} {
  const rows = getTimetable(dayKind, book);
  const slots: SlotAssignment[] = [];
  for (const row of rows) {
    if (row.golTime) slots.push(assignSlot(trips, "golshahr", row.golTime));
    if (row.tehTime) slots.push(assignSlot(trips, "tehran", row.tehTime));
  }
  return { slots, rows };
}

export function collectWarnings(trips: Trip[], slots: SlotAssignment[]): WarningItem[] {
  const warnings: WarningItem[] = [];

  const empty = trips.filter((t) => !hasName(t) && (t.role === "master" || t.role === "slave"));
  for (const t of empty) {
    warnings.push({
      level: "error",
      code: "empty-name",
      message: `ردیف بدون نام در ساعت ${t.time} از ${t.originRaw || "مبدأ نامشخص"} (${t.roleRaw || "نقش نامشخص"})`,
    });
  }

  for (const slot of slots) {
    if (slot.vacantMaster) {
      warnings.push({
        level: "warn",
        code: "vacant-master",
        message: `کسری راهبر در ${slot.time} از ${slot.origin === "golshahr" ? "گلشهر" : "تهران - صادقیه"}`,
      });
    }
    if (slot.vacantSlave) {
      warnings.push({
        level: "warn",
        code: "vacant-slave",
        message: `کسری کمک‌راهبر در ${slot.time} از ${slot.origin === "golshahr" ? "گلشهر" : "تهران - صادقیه"}`,
      });
    }
    if (slot.masters.length > 1) {
      warnings.push({
        level: "info",
        code: "multi-master",
        message: `بیش از یک راهبر در ${slot.time}: ${slot.masters.map((m) => m.displayName).join("، ")}`,
      });
    }
    if (slot.slaves.length > 1) {
      warnings.push({
        level: "info",
        code: "multi-slave",
        message: `بیش از یک کمک‌راهبر در ${slot.time}: ${slot.slaves.map((m) => m.displayName).join("، ")}`,
      });
    }
  }

  return warnings;
}
