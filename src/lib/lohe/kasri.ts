import { personKeys, type Personnel, type ShiftDuty } from "./personnel";
import type { CrewMember, ProcessResult } from "./types";

export interface KasriResult {
  duty: ShiftDuty;
  morningMissing: Personnel[];
  eveningMissing: Personnel[];
  overtime: Personnel[];
}

function periodOf(section: ProcessResult["timetableRows"][number]["section"]): "morning" | "evening" {
  return section === "evening" ? "evening" : "morning";
}

function addCrew(keys: Set<string>, people: CrewMember[]) {
  for (const p of people) {
    for (const k of personKeys(p)) keys.add(k);
  }
}

function presentKeys(result: ProcessResult, period: "morning" | "evening"): Set<string> {
  const keys = new Set<string>();
  for (const row of result.timetableRows) {
    if (periodOf(row.section) !== period) continue;
    for (const origin of ["golshahr", "tehran"] as const) {
      const time = origin === "golshahr" ? row.golTime : row.tehTime;
      if (!time) continue;
      const slot = result.slots.find((s) => s.origin === origin && s.time === time);
      if (!slot) continue;
      addCrew(keys, slot.masters);
      addCrew(keys, slot.slaves);
    }
  }
  return keys;
}

function isPresent(person: Personnel, keys: Set<string>): boolean {
  return personKeys(person).some((k) => keys.has(k));
}

function findPerson(book: Personnel[], member: CrewMember): Personnel | undefined {
  const keys = new Set(personKeys(member));
  return book.find((p) => personKeys(p).some((k) => keys.has(k)));
}

export function computeKasri(result: ProcessResult, people: Personnel[], duty: ShiftDuty): KasriResult {
  const morningPresent = presentKeys(result, "morning");
  const eveningPresent = presentKeys(result, "evening");

  const drivers = people.filter((p) => p.lineDriver && p.letter);
  const morningMissing = drivers.filter((p) => p.letter === duty.morning && !isPresent(p, morningPresent));
  const eveningMissing = drivers.filter((p) => p.letter === duty.evening && !isPresent(p, eveningPresent));

  const overtimeMap = new Map<string, Personnel>();
  for (const slot of result.slots) {
    for (const member of [...slot.masters, ...slot.slaves]) {
      const person = findPerson(people, member);
      if (!person || !person.letter) continue;
      if (person.letter === duty.morning || person.letter === duty.evening) continue;
      const key = person.personnelId || person.displayName;
      overtimeMap.set(key, person);
    }
  }

  return {
    duty,
    morningMissing,
    eveningMissing,
    overtime: [...overtimeMap.values()].sort(
      (a, b) => a.lastName.localeCompare(b.lastName, "fa") || a.firstName.localeCompare(b.firstName, "fa"),
    ),
  };
}

export function isOvertimeMember(member: CrewMember, kasri: KasriResult | null | undefined): boolean {
  if (!kasri) return false;
  const keys = new Set(personKeys(member));
  return kasri.overtime.some((p) => personKeys(p).some((k) => keys.has(k)));
}

export function isOvertimeName(name: string, kasri: KasriResult | null | undefined): boolean {
  if (!kasri || !name) return false;
  const compact = name.replace(/\s+/g, "");
  return kasri.overtime.some((p) => p.displayName === name || p.displayName.replace(/\s+/g, "") === compact);
}
