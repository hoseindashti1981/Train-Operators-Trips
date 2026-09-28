import { compactFa, displayName, normalizeFa, toEnglishDigits } from "./normalize";
import { loadXlsx } from "./xlsx-load";

export type ShiftLetter = "A" | "B" | "C";

export interface ShiftDuty {
  morning: ShiftLetter;
  evening: ShiftLetter;
}

export const DEFAULT_DUTY: ShiftDuty = { morning: "A", evening: "B" };

export interface Personnel {
  firstName: string;
  lastName: string;
  personnelId: string;
  role: string;
  dutyKind: string;
  letter: ShiftLetter | "";
  workplace: string;
  detached: boolean;
  lineDriver: boolean;
  displayName: string;
}

export interface PersonnelBook {
  fileName: string;
  people: Personnel[];
}

const STORAGE_KEY = "lohe-personnel-v1";
const DUTY_KEY = "lohe-shift-duty-v1";

export function parseShiftLetter(raw: string): ShiftLetter | "" {
  const n = compactFa(raw).toUpperCase();
  if (n.startsWith("A") || n === "ا" || n === "الف") return "A";
  if (n.startsWith("B") || n === "ب") return "B";
  if (n.startsWith("C") || n === "ج") return "C";
  return "";
}

function headerIndex(header: string[], ...needles: string[]): number {
  const compactNeedles = needles.map((n) => compactFa(n));
  return header.findIndex((h) => compactNeedles.some((n) => compactFa(h).includes(n)));
}

export async function parsePersonnelWorkbook(data: ArrayBuffer | Uint8Array, fileName: string): Promise<PersonnelBook> {
  const XLSX = await loadXlsx();
  const wb = XLSX.read(data, { type: "array", cellDates: true });
  const people: Personnel[] = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });
    let headerRow = -1;
    let cols = { first: 1, last: 2, id: 3, role: 4, dutyKind: 5, letter: 6, workplace: 7 };
    for (let i = 0; i < Math.min(rows.length, 12); i++) {
      const header = (rows[i] ?? []).map((c) => String(c ?? ""));
      const last = headerIndex(header, "نام خانواد");
      const id = headerIndex(header, "کد پرسنل", "كد پرسنل", "شماره پرسنل");
      const letter = headerIndex(header, "نوع شیفت", "نوع شيفت");
      if (last >= 0 && (id >= 0 || letter >= 0)) {
        headerRow = i;
        const firstExact = header.findIndex((h) => compactFa(h) === "نام");
        cols = {
          first: firstExact >= 0 ? firstExact : last > 0 ? last - 1 : 1,
          last,
          id: id >= 0 ? id : 3,
          role: headerIndex(header, "سمت") >= 0 ? headerIndex(header, "سمت") : 4,
          dutyKind: headerIndex(header, "شیفت کاری", "شيفت كاري") >= 0 ? headerIndex(header, "شیفت کاری", "شيفت كاري") : 5,
          letter: letter >= 0 ? letter : 6,
          workplace: headerIndex(header, "محل کار", "محل كار") >= 0 ? headerIndex(header, "محل کار", "محل كار") : 7,
        };
        break;
      }
    }
    if (headerRow < 0) continue;

    for (const row of rows.slice(headerRow + 1)) {
      const firstName = normalizeFa(String(row[cols.first] ?? ""));
      const lastName = normalizeFa(String(row[cols.last] ?? ""));
      const personnelId = toEnglishDigits(String(row[cols.id] ?? "")).replace(/\D/g, "");
      if (!lastName && !firstName && !personnelId) continue;
      const role = normalizeFa(String(row[cols.role] ?? ""));
      const dutyKind = normalizeFa(String(row[cols.dutyKind] ?? ""));
      const letterRaw = String(row[cols.letter] ?? "");
      const workplace = normalizeFa(String(row[cols.workplace] ?? ""));
      const letter = parseShiftLetter(letterRaw);
      const blob = compactFa(`${role} ${dutyKind} ${letterRaw}`);
      const detached = blob.includes("منفک") || blob.includes("منفك");
      const roleC = compactFa(role);
      const lineDriver = roleC.includes("قطار") && !roleC.includes("پایانه") && !roleC.includes("پايانه") && !detached;
      people.push({
        firstName,
        lastName,
        personnelId,
        role,
        dutyKind,
        letter,
        workplace,
        detached,
        lineDriver,
        displayName: displayName(lastName, firstName),
      });
    }
    if (people.length > 0) break;
  }

  if (people.length === 0) {
    throw new Error("لیست پرسنل شناخته نشد. ستون‌های نام خانوادگی و نوع شیفت لازم است.");
  }

  people.sort((a, b) => a.lastName.localeCompare(b.lastName, "fa") || a.firstName.localeCompare(b.firstName, "fa"));
  return { fileName, people };
}

export function personKeys(person: { personnelId?: string; firstName?: string; lastName?: string; displayName?: string }): string[] {
  const keys: string[] = [];
  const id = toEnglishDigits(person.personnelId ?? "").replace(/\D/g, "");
  if (id) keys.push(`id:${id}`);
  const name = compactFa(`${person.lastName ?? ""}${person.firstName ?? ""}`) || compactFa(person.displayName ?? "");
  if (name) keys.push(`n:${name}`);
  return keys;
}

export function sanitizeDuty(raw: unknown): ShiftDuty {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const morning = parseShiftLetter(String(src.morning ?? "A")) || "A";
  const evening = parseShiftLetter(String(src.evening ?? "B")) || "B";
  return { morning, evening };
}

export function loadDuty(): ShiftDuty {
  if (typeof localStorage === "undefined") return { ...DEFAULT_DUTY };
  try {
    const raw = localStorage.getItem(DUTY_KEY);
    if (!raw) return { ...DEFAULT_DUTY };
    return sanitizeDuty(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_DUTY };
  }
}

export function saveDuty(duty: ShiftDuty) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(DUTY_KEY, JSON.stringify(duty));
}

export function loadPersonnelBook(): PersonnelBook | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonnelBook;
    if (!Array.isArray(parsed.people) || parsed.people.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersonnelBook(book: PersonnelBook) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
}
