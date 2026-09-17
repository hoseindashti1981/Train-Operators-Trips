import { normalizeFa } from "./normalize";
import type { DriverRow, DriverTripCell, Trip } from "./types";

function hasName(trip: Trip): boolean {
  return Boolean(trip.firstName || trip.lastName);
}

function personKey(trip: Trip): string {
  if (trip.personnelId) return `id:${trip.personnelId}`;
  return `name:${normalizeFa(trip.lastName)}|${normalizeFa(trip.firstName)}`;
}

function cellKey(cell: DriverTripCell): string {
  return `${cell.time}|${cell.origin}|${cell.role}`;
}

/** فقط راهبر (مستر) و کمک‌راهبر (اسلیو)؛ سورت فامیلی؛ ساعت‌ها یکی‌یکی. */
export function buildDriverReport(trips: Trip[]): DriverRow[] {
  const map = new Map<
    string,
    { firstName: string; lastName: string; personnelId: string; cells: DriverTripCell[] }
  >();

  for (const trip of trips) {
    if (trip.role !== "master" && trip.role !== "slave") continue;
    if (!hasName(trip)) continue;
    const key = personKey(trip);
    let row = map.get(key);
    if (!row) {
      row = {
        firstName: trip.firstName,
        lastName: trip.lastName,
        personnelId: trip.personnelId,
        cells: [],
      };
      map.set(key, row);
    }
    row.cells.push({
      time: trip.time,
      role: trip.role,
      origin: trip.origin,
      dest: trip.dest,
    });
  }

  const rows: DriverRow[] = [...map.values()].map((row) => {
    const seen = new Set<string>();
    const unique: DriverTripCell[] = [];
    for (const cell of row.cells) {
      const k = cellKey(cell);
      if (seen.has(k)) continue;
      seen.add(k);
      unique.push(cell);
    }
    unique.sort((a, b) => a.time.localeCompare(b.time) || a.origin.localeCompare(b.origin));
    const count = unique.length;
    return {
      personnelId: row.personnelId,
      firstName: row.firstName,
      lastName: row.lastName,
      trips: unique,
      tripCount: count,
      unusual: count < 2 || count > 8,
    };
  });

  rows.sort((a, b) => {
    const last = a.lastName.localeCompare(b.lastName, "fa");
    if (last !== 0) return last;
    const first = a.firstName.localeCompare(b.firstName, "fa");
    if (first !== 0) return first;
    return a.personnelId.localeCompare(b.personnelId, "fa");
  });

  return rows;
}
