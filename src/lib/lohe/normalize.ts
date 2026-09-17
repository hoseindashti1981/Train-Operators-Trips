import type { RoleKind, StationKind } from "./types";

const ARABIC_YE = /[يى]/g;
const ARABIC_KAF = /ك/g;
const TATWEEL = /\u0640/g;
const ZW = /[\u200c\u200d\u200e\u200f]/g;

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const p = PERSIAN_DIGITS.indexOf(ch);
    if (p >= 0) return String(p);
    const a = ARABIC_DIGITS.indexOf(ch);
    return a >= 0 ? String(a) : ch;
  });
}

export function faNum(n: number): string {
  return n.toLocaleString("fa-IR");
}

export function normalizeFa(value: string): string {
  return toEnglishDigits(String(value ?? ""))
    .replace(ARABIC_YE, "ی")
    .replace(ARABIC_KAF, "ک")
    .replace(TATWEEL, "")
    .replace(ZW, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactFa(value: string): string {
  return normalizeFa(value).replace(/[\s\-–—_]/g, "");
}

export function classifyRole(raw: string): RoleKind {
  const n = compactFa(raw);
  if (!n) return "other";
  if (n.includes("آموزش")) return "trainee";
  if (n.includes("کمک") || n.includes("اسلیو") || n.includes("slave")) return "slave";
  if (n.includes("راهبر") || n.includes("مستر") || n.includes("اصلی") || n.includes("master")) return "master";
  return "other";
}

export function classifyStation(raw: string): StationKind {
  const n = compactFa(raw);
  if (!n) return "other";
  if (n.includes("گلشهر")) return "golshahr";
  if (n.includes("صادقیه") || n.includes("تهران")) return "tehran";
  return "other";
}

export function padTime(hours: number, minutes: number): string {
  const h = Math.max(0, Math.min(23, Math.floor(hours)));
  const m = Math.max(0, Math.min(59, Math.floor(minutes)));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseTimeToMinutes(raw: unknown): { time: string; minutes: number } | null {
  if (raw == null || raw === "") return null;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    let fraction = raw;
    if (raw >= 1) {
      fraction = raw % 1;
    }
    const total = Math.round(fraction * 24 * 60);
    const hours = Math.floor(total / 60) % 24;
    const minutes = total % 60;
    return { time: padTime(hours, minutes), minutes: hours * 60 + minutes };
  }

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    // Prefer UTC so a serial-converted Date is not shifted by local TZ.
    const hours = raw.getUTCHours();
    const minutes = raw.getUTCMinutes();
    return { time: padTime(hours, minutes), minutes: hours * 60 + minutes };
  }

  const text = toEnglishDigits(String(raw)).trim();
  const match = text.match(/(\d{1,2})[:.](\d{1,2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return { time: padTime(hours, minutes), minutes: hours * 60 + minutes };
}

export function displayName(lastName: string, firstName: string): string {
  return [normalizeFa(lastName), normalizeFa(firstName)].filter(Boolean).join(" ");
}

export function roleLabel(role: RoleKind): string {
  switch (role) {
    case "master":
      return "راهبر";
    case "slave":
      return "کمک‌راهبر";
    case "trainee":
      return "راهبر آموزشی";
    default:
      return "سایر";
  }
}

export function stationLabel(station: StationKind): string {
  switch (station) {
    case "golshahr":
      return "گلشهر";
    case "tehran":
      return "تهران - صادقیه";
    default:
      return "نامشخص";
  }
}

export function stationShort(station: StationKind): string {
  switch (station) {
    case "golshahr":
      return "گ";
    case "tehran":
      return "ت";
    default:
      return "؟";
  }
}

export function oppositeStation(station: StationKind): StationKind {
  if (station === "golshahr") return "tehran";
  if (station === "tehran") return "golshahr";
  return "other";
}
