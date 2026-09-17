import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Search, c as Download, i as TrainFront, l as CircleCheck, n as Upload, o as LoaderCircle, r as TriangleAlert, s as FileSpreadsheet, t as Users } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cokxc-Em.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight", {
	variants: { variant: {
		default: "border-transparent bg-muted text-foreground",
		accent: "border-transparent bg-primary text-primary-foreground",
		ok: "border-transparent bg-ok-bg text-ok",
		warn: "border-transparent bg-warn-bg text-warn",
		danger: "border-transparent bg-danger-bg text-danger",
		outline: "border-border text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			outline: "border border-border bg-transparent text-foreground hover:bg-muted",
			danger: "bg-danger text-primary-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 rounded-[var(--radius-sm)] px-4 text-sm",
			sm: "h-9 rounded-[var(--radius-xs)] px-3 text-xs",
			lg: "h-12 rounded-[var(--radius-md)] px-5 text-base",
			icon: "size-11 rounded-[var(--radius-sm)]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var ARABIC_YE = /[يى]/g;
var ARABIC_KAF = /ك/g;
var TATWEEL = /\u0640/g;
var ZW = /[\u200c\u200d\u200e\u200f]/g;
var PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
var ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function toEnglishDigits(value) {
	return value.replace(/[۰-۹٠-٩]/g, (ch) => {
		const p = PERSIAN_DIGITS.indexOf(ch);
		if (p >= 0) return String(p);
		const a = ARABIC_DIGITS.indexOf(ch);
		return a >= 0 ? String(a) : ch;
	});
}
function faNum(n) {
	return n.toLocaleString("fa-IR");
}
function normalizeFa(value) {
	return toEnglishDigits(String(value ?? "")).replace(ARABIC_YE, "ی").replace(ARABIC_KAF, "ک").replace(TATWEEL, "").replace(ZW, "").replace(/\s+/g, " ").trim();
}
function compactFa(value) {
	return normalizeFa(value).replace(/[\s\-–—_]/g, "");
}
function classifyRole(raw) {
	const n = compactFa(raw);
	if (!n) return "other";
	if (n.includes("آموزش")) return "trainee";
	if (n.includes("کمک") || n.includes("اسلیو") || n.includes("slave")) return "slave";
	if (n.includes("راهبر") || n.includes("مستر") || n.includes("اصلی") || n.includes("master")) return "master";
	return "other";
}
function classifyStation(raw) {
	const n = compactFa(raw);
	if (!n) return "other";
	if (n.includes("گلشهر")) return "golshahr";
	if (n.includes("صادقیه") || n.includes("تهران")) return "tehran";
	return "other";
}
function padTime(hours, minutes) {
	const h = Math.max(0, Math.min(23, Math.floor(hours)));
	const m = Math.max(0, Math.min(59, Math.floor(minutes)));
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function parseTimeToMinutes(raw) {
	if (raw == null || raw === "") return null;
	if (typeof raw === "number" && Number.isFinite(raw)) {
		let fraction = raw;
		if (raw >= 1) fraction = raw % 1;
		const total = Math.round(fraction * 24 * 60);
		const hours = Math.floor(total / 60) % 24;
		const minutes = total % 60;
		return {
			time: padTime(hours, minutes),
			minutes: hours * 60 + minutes
		};
	}
	if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
		const hours = raw.getUTCHours();
		const minutes = raw.getUTCMinutes();
		return {
			time: padTime(hours, minutes),
			minutes: hours * 60 + minutes
		};
	}
	const match = toEnglishDigits(String(raw)).trim().match(/(\d{1,2})[:.](\d{1,2})/);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
	return {
		time: padTime(hours, minutes),
		minutes: hours * 60 + minutes
	};
}
function displayName(lastName, firstName) {
	return [normalizeFa(lastName), normalizeFa(firstName)].filter(Boolean).join(" ");
}
function roleLabel(role) {
	switch (role) {
		case "master": return "راهبر";
		case "slave": return "کمک‌راهبر";
		case "trainee": return "راهبر آموزشی";
		default: return "سایر";
	}
}
function stationLabel(station) {
	switch (station) {
		case "golshahr": return "گلشهر";
		case "tehran": return "تهران - صادقیه";
		default: return "نامشخص";
	}
}
function stationShort(station) {
	switch (station) {
		case "golshahr": return "گ";
		case "tehran": return "ت";
		default: return "؟";
	}
}
function oppositeStation(station) {
	if (station === "golshahr") return "tehran";
	if (station === "tehran") return "golshahr";
	return "other";
}
var WEEKDAYS = [
	"یکشنبه",
	"دوشنبه",
	"سه‌شنبه",
	"چهارشنبه",
	"پنجشنبه",
	"جمعه",
	"شنبه"
];
function div(a, b) {
	return Math.trunc(a / b);
}
/** Jalali → Gregorian (jalaali-js algorithm). */
function jalaliToGregorian(jy, jm, jd) {
	let gy = jy <= 979 ? 621 : 1600;
	jy -= jy <= 979 ? 0 : 979;
	let days = 365 * jy + div(jy, 33) * 8 + div(jy % 33 + 3, 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
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
	const salA = [
		0,
		31,
		gy % 4 === 0 && gy % 100 !== 0 || gy % 400 === 0 ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	let gm = 0;
	for (gm = 1; gm <= 12 && gd > salA[gm]; gm++) gd -= salA[gm];
	return [
		gy,
		gm,
		gd
	];
}
function parseJalaliDate(raw) {
	const m = String(raw ?? "").trim().match(/(\d{3,4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
	if (!m) return null;
	const jy = Number(m[1]);
	const jm = Number(m[2]);
	const jd = Number(m[3]);
	if (jy < 1200 || jy > 1600 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
	return {
		jy,
		jm,
		jd
	};
}
function weekdayFromJalali(raw) {
	const parsed = parseJalaliDate(raw);
	if (!parsed) return null;
	const [gy, gm, gd] = jalaliToGregorian(parsed.jy, parsed.jm, parsed.jd);
	const jsDay = new Date(Date.UTC(gy, gm - 1, gd)).getUTCDay();
	const name = WEEKDAYS[jsDay] ?? "نامشخص";
	let dayKind = "weekday";
	if (jsDay === 4) dayKind = "thursday";
	if (jsDay === 5) dayKind = "friday";
	return {
		name,
		dayKind,
		jsDay
	};
}
function dayKindLabel(kind) {
	if (kind === "thursday") return "پنجشنبه";
	if (kind === "friday") return "جمعه";
	return "روز عادی";
}
function rowsFrom(pairs) {
	return pairs.map(([golTime, tehTime]) => {
		const hour = Number((golTime ?? tehTime ?? "12:00").slice(0, 2));
		let section = "morning";
		if (hour >= 12 && hour < 19) section = "midday";
		else if (hour >= 19 || hour < 4) section = "evening";
		return {
			golTime,
			tehTime,
			section
		};
	});
}
var TIMETABLES = {
	weekday: rowsFrom([
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
		["22:00", "22:00"]
	]),
	thursday: rowsFrom([
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
		["22:00", "22:00"]
	]),
	friday: rowsFrom([
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
		["22:00", "22:00"]
	])
};
function getTimetable(kind) {
	return TIMETABLES[kind];
}
function hasName$1(trip) {
	return Boolean(trip.firstName || trip.lastName);
}
function personKey(trip) {
	if (trip.personnelId) return `id:${trip.personnelId}`;
	return `name:${normalizeFa(trip.lastName)}|${normalizeFa(trip.firstName)}`;
}
function cellKey(cell) {
	return `${cell.time}|${cell.origin}|${cell.role}`;
}
/** فقط راهبر (مستر) و کمک‌راهبر (اسلیو)؛ سورت فامیلی؛ ساعت‌ها یکی‌یکی. */
function buildDriverReport(trips) {
	const map = /* @__PURE__ */ new Map();
	for (const trip of trips) {
		if (trip.role !== "master" && trip.role !== "slave") continue;
		if (!hasName$1(trip)) continue;
		const key = personKey(trip);
		let row = map.get(key);
		if (!row) {
			row = {
				firstName: trip.firstName,
				lastName: trip.lastName,
				personnelId: trip.personnelId,
				cells: []
			};
			map.set(key, row);
		}
		row.cells.push({
			time: trip.time,
			role: trip.role,
			origin: trip.origin,
			dest: trip.dest
		});
	}
	const rows = [...map.values()].map((row) => {
		const seen = /* @__PURE__ */ new Set();
		const unique = [];
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
			unusual: count < 2 || count > 8
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
function toCrew(trip) {
	return {
		personnelId: trip.personnelId,
		firstName: trip.firstName,
		lastName: trip.lastName,
		role: trip.role,
		displayName: displayName(trip.lastName, trip.firstName)
	};
}
function hasName(trip) {
	return Boolean(trip.firstName || trip.lastName);
}
function pick(trips, origin, time, role) {
	return trips.filter((t) => t.origin === origin && t.time === time && t.role === role && hasName(t)).map(toCrew);
}
function assignSlot(trips, origin, time) {
	const dest = oppositeStation(origin);
	const masters = pick(trips, origin, time, "master");
	const slaves = pick(trips, origin, time, "slave");
	const trainees = pick(trips, origin, time, "trainee");
	const emptyNamed = trips.some((t) => t.origin === origin && t.time === time && !hasName(t) && (t.role === "master" || t.role === "slave"));
	return {
		time,
		origin,
		dest,
		masters,
		slaves,
		trainees,
		vacantMaster: masters.length === 0,
		vacantSlave: slaves.length === 0,
		emptyNamed
	};
}
function matchSlots(trips, dayKind) {
	const rows = getTimetable(dayKind);
	const slots = [];
	for (const row of rows) {
		if (row.golTime) slots.push(assignSlot(trips, "golshahr", row.golTime));
		if (row.tehTime) slots.push(assignSlot(trips, "tehran", row.tehTime));
	}
	return {
		slots,
		rows
	};
}
function collectWarnings(trips, slots) {
	const warnings = [];
	const empty = trips.filter((t) => !hasName(t) && (t.role === "master" || t.role === "slave"));
	for (const t of empty) warnings.push({
		level: "error",
		code: "empty-name",
		message: `ردیف بدون نام در ساعت ${t.time} از ${t.originRaw || "مبدأ نامشخص"} (${t.roleRaw || "نقش نامشخص"})`
	});
	for (const slot of slots) {
		if (slot.vacantMaster) warnings.push({
			level: "warn",
			code: "vacant-master",
			message: `کسری راهبر در ${slot.time} از ${slot.origin === "golshahr" ? "گلشهر" : "تهران - صادقیه"}`
		});
		if (slot.vacantSlave) warnings.push({
			level: "warn",
			code: "vacant-slave",
			message: `کسری کمک‌راهبر در ${slot.time} از ${slot.origin === "golshahr" ? "گلشهر" : "تهران - صادقیه"}`
		});
		if (slot.masters.length > 1) warnings.push({
			level: "info",
			code: "multi-master",
			message: `بیش از یک راهبر در ${slot.time}: ${slot.masters.map((m) => m.displayName).join("، ")}`
		});
		if (slot.slaves.length > 1) warnings.push({
			level: "info",
			code: "multi-slave",
			message: `بیش از یک کمک‌راهبر در ${slot.time}: ${slot.slaves.map((m) => m.displayName).join("، ")}`
		});
	}
	return warnings;
}
/** Browser-safe lazy load — never import `xlsx` at module top-level. */
async function loadXlsx() {
	const ns = await import("../_libs/xlsx.mjs").then((n) => n.t);
	return ns.default ?? ns;
}
function cellText(value) {
	if (value == null) return "";
	if (value instanceof Date) return "";
	if (typeof value === "number") return String(value);
	return String(value);
}
function scoreHeaderCell(text) {
	const n = compactFa(text);
	if (!n) return null;
	if (n.includes("نوعاعزام") || n === "نوع") return "role";
	if (n.includes("کدپرسنل") || n.includes("شمارهپرسنل") || n === "کد") return "id";
	if (n.includes("نامخانوادگ") || n.includes("فامیل")) return "last";
	if (n.includes("نامراهبر") || n === "نام") return "first";
	if (n.includes("ایستگاهمقصد") || n === "مقصد") return "dest";
	if (n.includes("ایستگاهمبدا") || n.includes("ایستگاهمبدأ") || n === "مبدا" || n === "مبدأ") return "origin";
	if (n.includes("زمانحرکت") || n.includes("زمانحزکت") || n === "ساعت") return "time";
	if (n.includes("تاریخپردازش") || n.includes("تاریخ") && n.includes("پردازش")) return "date";
	return null;
}
function detectHeaders(rows) {
	for (let r = 0; r < Math.min(rows.length, 25); r++) {
		const row = rows[r] ?? [];
		const found = {};
		row.forEach((cell, c) => {
			const key = scoreHeaderCell(cellText(cell));
			if (key && found[key] == null) found[key] = c;
		});
		if (found.role != null && found.time != null && (found.first != null || found.last != null)) return {
			headerRow: r,
			map: {
				role: found.role,
				id: found.id ?? -1,
				first: found.first ?? -1,
				last: found.last ?? -1,
				dest: found.dest ?? -1,
				origin: found.origin ?? -1,
				time: found.time,
				date: found.date ?? -1
			}
		};
	}
	return null;
}
function personnelId(value) {
	if (value == null || value === "") return "";
	if (typeof value === "number" && Number.isFinite(value)) return String(Math.round(value));
	return normalizeFa(String(value)).replace(/\.0$/, "");
}
function pickMeta(rows) {
	const blob = rows.slice(0, 6).flat().map((c) => cellText(c)).filter(Boolean);
	let reportDate = "";
	let processDate = "";
	let userName = "";
	let line = "";
	let title = "";
	for (let i = 0; i < blob.length; i++) {
		const t = normalizeFa(blob[i] ?? "");
		if (t.includes("تاریخ اخذ گزارش") && blob[i - 1]) reportDate = normalizeFa(blob[i - 1] ?? "");
		if (t.includes("نام کاربر") && blob[i - 1]) userName = normalizeFa(blob[i - 1] ?? "");
		if (t.includes("لوحه اعزام")) title = t;
		if (t === "خط" && blob[i - 1]) line = normalizeFa(blob[i - 1] ?? "");
	}
	return {
		reportDate,
		processDate,
		userName,
		line,
		title
	};
}
function extractTrips(rows, map, headerRow) {
	const trips = [];
	for (let r = headerRow + 1; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const roleRaw = normalizeFa(cellText(row[map.role]));
		const parsedTime = parseTimeToMinutes(map.time >= 0 ? row[map.time] : "");
		if (!parsedTime) continue;
		if (!roleRaw && !personnelId(map.id >= 0 ? row[map.id] : "")) continue;
		const firstName = map.first >= 0 ? normalizeFa(cellText(row[map.first])) : "";
		const lastName = map.last >= 0 ? normalizeFa(cellText(row[map.last])) : "";
		const originRaw = map.origin >= 0 ? normalizeFa(cellText(row[map.origin])) : "";
		const destRaw = map.dest >= 0 ? normalizeFa(cellText(row[map.dest])) : "";
		const date = map.date >= 0 ? normalizeFa(cellText(row[map.date])) : "";
		const role = classifyRole(roleRaw);
		if (role === "other" && !firstName && !lastName) continue;
		trips.push({
			role,
			roleRaw,
			personnelId: map.id >= 0 ? personnelId(row[map.id]) : "",
			firstName,
			lastName,
			origin: classifyStation(originRaw),
			originRaw,
			dest: classifyStation(destRaw),
			destRaw,
			time: parsedTime.time,
			minutes: parsedTime.minutes,
			date,
			sourceRow: r + 1
		});
	}
	return trips;
}
function namedCrewCount(trips) {
	return trips.filter((t) => (t.role === "master" || t.role === "slave") && (t.firstName || t.lastName)).length;
}
async function parseWorkbook(data, fileName) {
	const XLSX = await loadXlsx();
	const wb = XLSX.read(data, {
		type: "array",
		cellDates: false,
		raw: true
	});
	let best = null;
	for (const sheetName of wb.SheetNames) {
		const sheet = wb.Sheets[sheetName];
		if (!sheet) continue;
		const rows = XLSX.utils.sheet_to_json(sheet, {
			header: 1,
			raw: true,
			defval: "",
			blankrows: false
		});
		const headers = detectHeaders(rows);
		if (!headers) continue;
		const trips = extractTrips(rows, headers.map, headers.headerRow);
		const score = namedCrewCount(trips);
		if (!best || score > best.score) best = {
			sheetName,
			trips,
			metaBits: pickMeta(rows),
			score
		};
	}
	if (!best || best.trips.length === 0) throw new Error("ساختار گزارش اولیه شناخته نشد. ستون‌های نوع اعزام، نام و زمان حرکت باید در فایل باشند.");
	if (best.score === 0) throw new Error("در این فایل اعزام راهبر یا کمک‌راهبر با نام پیدا نشد. فایل «اولیه» روزانه را بارگذاری کنید، نه لوحه خالی.");
	const processDate = best.trips.find((t) => t.date)?.date ?? best.metaBits.processDate;
	return {
		trips: best.trips,
		meta: {
			fileName,
			reportDate: best.metaBits.reportDate,
			processDate,
			userName: best.metaBits.userName,
			line: best.metaBits.line,
			title: best.metaBits.title || "لوحه اعزام",
			sheetName: best.sheetName,
			rowCount: best.trips.length
		}
	};
}
function processTrips(trips, meta, dayKindOverride) {
	const weekday = meta.processDate ? weekdayFromJalali(meta.processDate) : null;
	const detected = weekday?.dayKind ?? "weekday";
	const dayKind = !dayKindOverride || dayKindOverride === "auto" ? detected : dayKindOverride;
	const { slots } = matchSlots(trips, dayKind);
	const drivers = buildDriverReport(trips);
	const warnings = collectWarnings(trips, slots);
	const namedTripCount = trips.filter((t) => (t.role === "master" || t.role === "slave") && (t.firstName || t.lastName)).length;
	const filledCrewPairs = slots.filter((s) => !s.vacantMaster && !s.vacantSlave).length;
	const vacantSlots = slots.filter((s) => s.vacantMaster || s.vacantSlave).length;
	const traineeCount = trips.filter((t) => t.role === "trainee").length;
	if (drivers.some((d) => d.unusual)) {
		const odd = drivers.filter((d) => d.unusual);
		warnings.push({
			level: "info",
			code: "unusual-count",
			message: `${faNum(odd.length)} راهبر تعداد حرکت غیرمعمول دارند (کمتر از ۲ یا بیشتر از ۸).`
		});
	}
	return {
		meta,
		trips,
		dayKind,
		weekdayName: weekday?.name ?? dayKindLabel(dayKind),
		slots,
		drivers,
		warnings,
		stats: {
			tripCount: trips.length,
			namedTripCount,
			driverCount: drivers.length,
			filledCrewPairs,
			vacantSlots,
			traineeCount
		}
	};
}
async function processWorkbook(data, fileName, dayKindOverride) {
	const { trips, meta } = await parseWorkbook(data, fileName);
	return processTrips(trips, meta, dayKindOverride);
}
function slotAt$1(slots, origin, time) {
	if (!time) return null;
	return slots.find((s) => s.origin === origin && s.time === time) ?? null;
}
function names(slot, kind) {
	if (!slot) return "";
	return slot[kind].map((p) => p.displayName).join(" / ");
}
function ids(slot, kind) {
	if (!slot) return "";
	return slot[kind].map((p) => p.personnelId).filter(Boolean).join(" / ");
}
async function buildExportWorkbook(result) {
	const XLSX = await loadXlsx();
	const wb = XLSX.utils.book_new();
	const rows = getTimetable(result.dayKind);
	const pardazesh = [[
		"زمان حرکت گلشهر",
		"راهبر (H1 / مستر)",
		"کمک‌راهبر (R / اسلیو)",
		"راهبر آموزشی (T)",
		"کد راهبر",
		"کد کمک",
		"",
		"زمان حرکت تهران",
		"راهبر (H1 / مستر)",
		"کمک‌راهبر (R / اسلیو)",
		"راهبر آموزشی (T)",
		"کد راهبر",
		"کد کمک"
	]];
	for (const row of rows) {
		const gol = slotAt$1(result.slots, "golshahr", row.golTime);
		const teh = slotAt$1(result.slots, "tehran", row.tehTime);
		if (!row.golTime && !row.tehTime) {
			pardazesh.push([]);
			continue;
		}
		pardazesh.push([
			row.golTime ?? "",
			names(gol, "masters"),
			names(gol, "slaves"),
			names(gol, "trainees"),
			ids(gol, "masters"),
			ids(gol, "slaves"),
			"",
			row.tehTime ?? "",
			names(teh, "masters"),
			names(teh, "slaves"),
			names(teh, "trainees"),
			ids(teh, "masters"),
			ids(teh, "slaves")
		]);
	}
	const maxTrips = result.drivers.reduce((m, d) => Math.max(m, d.tripCount), 0);
	const hourCols = Math.max(maxTrips, 2);
	const driverHeader = [
		"نام",
		"نام خانوادگی",
		"شماره پرسنلی",
		"تعداد حرکت"
	];
	for (let i = 1; i <= hourCols; i++) driverHeader.push(`حرکت ${i}`);
	const driverAoA = [[`گزارش راهبران — مرتب‌سازی فامیلی — ${result.meta.processDate || result.meta.fileName}`], driverHeader];
	for (const d of result.drivers) {
		const line = [
			d.firstName,
			d.lastName,
			d.personnelId,
			d.tripCount
		];
		for (let i = 0; i < hourCols; i++) {
			const t = d.trips[i];
			line.push(t ? t.time : "");
		}
		driverAoA.push(line);
	}
	const detail = [[
		"نوع اعزام",
		"کد پرسنلی",
		"نام",
		"نام خانوادگی",
		"مبدأ",
		"مقصد",
		"زمان حرکت",
		"تاریخ"
	]];
	for (const t of result.trips) {
		if (t.role !== "master" && t.role !== "slave" && t.role !== "trainee") continue;
		detail.push([
			t.roleRaw || roleLabel(t.role),
			t.personnelId,
			t.firstName,
			t.lastName,
			t.originRaw || stationLabel(t.origin),
			t.destRaw || stationLabel(t.dest),
			t.time,
			t.date
		]);
	}
	const warnAoA = [[
		"سطح",
		"کد",
		"پیام"
	]];
	for (const w of result.warnings) warnAoA.push([
		w.level,
		w.code,
		w.message
	]);
	if (result.warnings.length === 0) warnAoA.push([
		"info",
		"ok",
		"هشداری ثبت نشد."
	]);
	const s1 = XLSX.utils.aoa_to_sheet(pardazesh);
	const s2 = XLSX.utils.aoa_to_sheet(driverAoA);
	const s3 = XLSX.utils.aoa_to_sheet(detail);
	const s4 = XLSX.utils.aoa_to_sheet(warnAoA);
	s1["!cols"] = Array.from({ length: 13 }, () => ({ wch: 22 }));
	s2["!cols"] = [
		{ wch: 16 },
		{ wch: 22 },
		{ wch: 14 },
		{ wch: 12 },
		...Array.from({ length: hourCols }, () => ({ wch: 10 }))
	];
	s3["!cols"] = [
		{ wch: 16 },
		{ wch: 12 },
		{ wch: 14 },
		{ wch: 22 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 12 },
		{ wch: 14 }
	];
	s4["!cols"] = [
		{ wch: 10 },
		{ wch: 16 },
		{ wch: 70 }
	];
	freeze(s1);
	freeze(s2, 2);
	freeze(s3);
	freeze(s4);
	rtlBook(XLSX, wb);
	XLSX.utils.book_append_sheet(wb, s1, "پردازش");
	XLSX.utils.book_append_sheet(wb, s2, "گزارش راهبران");
	XLSX.utils.book_append_sheet(wb, s3, "جزئیات اعزام");
	XLSX.utils.book_append_sheet(wb, s4, "هشدارها");
	return wb;
}
function freeze(sheet, ySplit = 1) {
	sheet["!views"] = [{
		state: "frozen",
		xSplit: 0,
		ySplit,
		topLeftCell: `A${ySplit + 1}`,
		activeCell: `A${ySplit + 1}`
	}];
}
function rtlBook(XLSX, wb) {
	wb.Workbook = wb.Workbook || {};
	wb.Workbook.Views = [{ RTL: true }];
}
async function downloadWorkbook(result) {
	const XLSX = await loadXlsx();
	const wb = await buildExportWorkbook(result);
	const date = (result.meta.processDate || "export").replace(/\//g, "-");
	XLSX.writeFile(wb, `lohe-pardazesh-${date}.xlsx`);
}
var TABS = [
	{
		id: "roster",
		label: "لوحه پردازش"
	},
	{
		id: "drivers",
		label: "گزارش راهبران"
	},
	{
		id: "detail",
		label: "جزئیات اعزام"
	},
	{
		id: "warnings",
		label: "هشدارها"
	}
];
function slotAt(slots, origin, time) {
	if (!time) return null;
	return slots.find((s) => s.origin === origin && s.time === time) ?? null;
}
function crewText(people) {
	if (people.length === 0) return "—";
	return people.map((p) => p.displayName).join(" / ");
}
function LoheApp() {
	const inputRef = (0, import_react.useRef)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [dayChoice, setDayChoice] = (0, import_react.useState)("auto");
	const [tab, setTab] = (0, import_react.useState)("roster");
	const [query, setQuery] = (0, import_react.useState)("");
	const [showTrainee, setShowTrainee] = (0, import_react.useState)(false);
	const [fileLabel, setFileLabel] = (0, import_react.useState)(null);
	async function runFile(file, override = dayChoice) {
		setBusy(true);
		try {
			const processed = await processWorkbook(await file.arrayBuffer(), file.name, override);
			setResult(processed);
			setFileLabel(file.name);
			setTab("roster");
			toast.success(`${faNum(processed.stats.namedTripCount)} اعزام از ${file.name} پردازش شد`);
		} catch (err) {
			const message = err instanceof Error ? err.message : "خواندن فایل ناموفق بود";
			toast.error(message);
		} finally {
			setBusy(false);
		}
	}
	async function loadDemo() {
		setBusy(true);
		try {
			const res = await fetch("/samples/gozaresh-avaliye.xls");
			if (!res.ok) throw new Error("نمونه در دسترس نیست");
			const processed = await processWorkbook(await res.arrayBuffer(), "اولیه 3.xls", dayChoice);
			setResult(processed);
			setFileLabel("نمونه: اولیه 3.xls");
			setTab("roster");
			toast.success("نمونه گزارش روزانه بارگذاری شد");
		} catch (err) {
			const message = err instanceof Error ? err.message : "بارگذاری نمونه ناموفق بود";
			toast.error(message);
		} finally {
			setBusy(false);
		}
	}
	async function exportExcel() {
		if (!result) return;
		try {
			await downloadWorkbook(result);
		} catch (err) {
			const message = err instanceof Error ? err.message : "خروجی اکسل ساخته نشد";
			toast.error(message);
		}
	}
	function onFiles(files) {
		const file = files?.[0];
		if (!file) return;
		runFile(file);
	}
	function changeDay(next) {
		setDayChoice(next);
		if (result) setResult(processTrips(result.trips, result.meta, next));
	}
	const filteredDrivers = (0, import_react.useMemo)(() => {
		if (!result) return [];
		const q = query.trim();
		if (!q) return result.drivers;
		return result.drivers.filter((d) => [
			d.firstName,
			d.lastName,
			d.personnelId,
			...d.trips.map((t) => t.time)
		].some((x) => x.includes(q)));
	}, [result, query]);
	const filteredTrips = (0, import_react.useMemo)(() => {
		if (!result) return [];
		const q = query.trim();
		const crew = result.trips.filter((t) => t.role === "master" || t.role === "slave" || t.role === "trainee");
		if (!q) return crew;
		return crew.filter((t) => [
			t.firstName,
			t.lastName,
			t.personnelId,
			t.time,
			t.roleRaw,
			t.originRaw
		].some((x) => x.includes(q)));
	}, [result, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				theme: "dark",
				dir: "rtl",
				toastOptions: { className: "font-sans !bg-elevated !text-fg !border-border" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-border bg-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrainFront, {
								className: "size-5 text-primary",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-wide text-muted-foreground",
								children: "خط ۵ · گلشهر ↔ صادقیه"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-xl font-semibold leading-snug sm:text-2xl",
								children: "لوحه‌ساز سیر و اعزام"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-xl text-sm text-muted-foreground",
								children: "گزارش روزانه را بگذارید؛ فقط راهبر و کمک‌راهبر ساعت‌های شیت خروجی پر می‌شود."
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => inputRef.current?.click(),
								disabled: busy,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "بارگذاری اولیه"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => void loadDemo(),
								disabled: busy,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, {}), "نمونه گزارش"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => void exportExcel(),
								disabled: !result,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "خروجی اکسل"]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-7xl px-4 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						accept: ".xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						className: "hidden",
						onChange: (e) => {
							onFiles(e.target.files);
							e.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						onDragOver: (e) => {
							e.preventDefault();
							setDragging(true);
						},
						onDragLeave: () => setDragging(false),
						onDrop: (e) => {
							e.preventDefault();
							setDragging(false);
							onFiles(e.dataTransfer.files);
						},
						className: cn("rounded-[var(--radius-xl)] border border-dashed bg-surface p-5 transition-colors duration-[var(--motion-fast)] sm:p-6", dragging ? "border-primary bg-elevated" : "border-border"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "فایل گزارش اولیه (xls / xlsx)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: fileLabel ?? "فایل را بکشید اینجا یا از نمونه آماده استفاده کنید."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-1 text-xs text-muted-foreground",
									children: ["نوع روز", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: dayChoice,
										onChange: (e) => changeDay(e.target.value),
										className: "h-11 min-w-40 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm text-fg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "auto",
												children: "تشخیص خودکار از تاریخ"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "weekday",
												children: "روز عادی"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "thursday",
												children: "پنجشنبه"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "friday",
												children: "جمعه"
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: showTrainee,
										onChange: (e) => setShowTrainee(e.target.checked),
										className: "size-4 accent-primary"
									}), "نمایش راهبر آموزشی"]
								})]
							})]
						})
					}),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "در حال پردازش لوحه…"]
					}),
					!result && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyGuide, { onDemo: () => void loadDemo() }),
					result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsRow, { result }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1 rounded-[var(--radius-md)] border border-border bg-surface p-1",
								children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setTab(item.id),
									className: cn("h-11 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]", tab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-fg"),
									children: [item.label, item.id === "warnings" && result.warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ms-2 tabular-nums",
										children: [
											"(",
											faNum(result.warnings.length),
											")"
										]
									}) : null]
								}, item.id))
							}), (tab === "drivers" || tab === "detail") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: tab === "drivers" ? "جستجوی فامیل یا کد پرسنلی" : "جستجو در اعزام‌ها",
									className: "h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface pe-4 ps-10 text-sm sm:w-72"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [
								tab === "roster" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterBoard, {
									result,
									showTrainee
								}),
								tab === "drivers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriverTable, { rows: filteredDrivers }),
								tab === "detail" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTable, { trips: filteredTrips }),
								tab === "warnings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningsPanel, { result })
							]
						})
					] })
				]
			})
		]
	});
}
function EmptyGuide({ onDemo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-3",
			children: [
				{
					title: "۱. گزارش اولیه",
					body: "فایل روزانه اعزام را بارگذاری کنید. ستون‌های نوع اعزام، نام، مبدأ و زمان حرکت به‌صورت خودکار پیدا می‌شوند."
				},
				{
					title: "۲. تطبیق ساعت خروجی",
					body: "فقط ساعت‌هایی که در لوحه خروجی نوشته شده‌اند پر می‌شوند؛ راهبر (مستر / H1) و کمک‌راهبر (اسلیو / R) کنار هم می‌آیند."
				},
				{
					title: "۳. گزارش نفرات",
					body: "شیت جدا با مرتب‌سازی فامیلی: نام، نام خانوادگی، شماره پرسنلی و ساعت حرکت‌ها یکی‌یکی."
				}
			].map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-[var(--radius-xl)] border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: card.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: card.body
				})]
			}, card.title))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-center pt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: onDemo,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, {}), "مشاهده با نمونه گزارش"]
			})
		})]
	});
}
function StatsRow({ result }) {
	const items = [
		{
			label: "اعزام نام‌دار",
			value: faNum(result.stats.namedTripCount),
			icon: TrainFront,
			tone: "default"
		},
		{
			label: "راهبران یکتا",
			value: faNum(result.stats.driverCount),
			icon: Users,
			tone: "default"
		},
		{
			label: "جفت کامل",
			value: faNum(result.stats.filledCrewPairs),
			icon: CircleCheck,
			tone: "ok"
		},
		{
			label: "کسری ساعت",
			value: faNum(result.stats.vacantSlots),
			icon: TriangleAlert,
			tone: result.stats.vacantSlots > 0 ? "warn" : "ok"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-[var(--radius-lg)] border border-border bg-surface p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium",
						children: item.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-2 text-2xl font-semibold tabular-nums leading-none", item.tone === "ok" && "text-ok", item.tone === "warn" && "text-warn"),
					children: item.value
				}),
				item.label === "کسری ساعت" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						dayKindLabel(result.dayKind),
						" · ",
						result.weekdayName
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: result.meta.processDate || "بدون تاریخ"
				})
			]
		}, item.label))
	});
}
function RosterBoard({ result, showTrainee }) {
	const rows = getTimetable(result.dayKind);
	const sections = [
		{
			key: "morning",
			title: "صبح"
		},
		{
			key: "midday",
			title: "میان‌روز"
		},
		{
			key: "evening",
			title: "پایان خط"
		}
	];
	const span = showTrainee ? 4 : 3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-right text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("thead", {
				className: "sticky top-0 z-10 bg-muted text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					colSpan: span,
					className: "px-3 py-2 font-medium",
					children: "گلشهر → تهران - صادقیه"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					colSpan: span,
					className: "border-r border-border px-3 py-2 font-medium",
					children: "تهران - صادقیه → گلشهر"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderCells, { showTrainee }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderCells, {
					showTrainee,
					edge: true
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sections.map((section) => {
				const slice = rows.filter((r) => r.section === section.key);
				if (slice.every((r) => !r.golTime && !r.tehTime)) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterSection, {
					title: section.title,
					rows: slice,
					result,
					showTrainee,
					span
				}, section.key);
			}) })]
		})
	});
}
function HeaderCells({ showTrainee, edge }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
			className: cn("px-3 py-2 font-medium", edge ? "border-r border-border" : ""),
			children: "ساعت"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
			className: "px-3 py-2 font-medium",
			children: "راهبر (H1)"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
			className: "px-3 py-2 font-medium",
			children: "کمک‌راهبر (R)"
		}),
		showTrainee ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
			className: "px-3 py-2 font-medium",
			children: "آموزشی (T)"
		}) : null
	] });
}
function RosterSection({ title, rows, result, showTrainee, span }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
		className: "bg-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			colSpan: span * 2,
			className: "px-3 py-1.5 text-xs font-semibold text-muted-foreground",
			children: title
		})
	}), rows.map((row, idx) => {
		if (!row.golTime && !row.tehTime) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			colSpan: span * 2,
			className: "h-2 bg-bg/40"
		}) }, `${title}-gap-${idx}`);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "border-t border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotCells, {
				origin: "golshahr",
				time: row.golTime,
				result,
				showTrainee
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotCells, {
				origin: "tehran",
				time: row.tehTime,
				result,
				showTrainee,
				edge: true
			})]
		}, `${title}-${row.golTime}-${row.tehTime}-${idx}`);
	})] });
}
function SlotCells({ origin, time, result, showTrainee, edge }) {
	const slot = slotAt(result.slots, origin, time);
	const edgeClass = edge ? "border-r border-border" : "";
	if (!time) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: cn("px-3 py-2 text-muted-foreground", edgeClass),
			children: "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2 text-muted-foreground",
			children: "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2 text-muted-foreground",
			children: "—"
		}),
		showTrainee ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2 text-muted-foreground",
			children: "—"
		}) : null
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: cn("px-3 py-2 font-medium tabular-nums text-line", edgeClass),
			children: time
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrewCell, {
				people: slot?.masters ?? [],
				vacant: slot?.vacantMaster
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrewCell, {
				people: slot?.slaves ?? [],
				vacant: slot?.vacantSlave
			})
		}),
		showTrainee ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2 text-muted-foreground",
			children: crewText(slot?.trainees ?? [])
		}) : null
	] });
}
function CrewCell({ people, vacant }) {
	if (vacant) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-warn",
		children: "کسری"
	});
	if (people.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: crewText(people) }), people[0]?.personnelId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs tabular-nums text-muted-foreground",
			children: people[0].personnelId
		}) : null]
	});
}
function DriverTable({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-sm text-muted-foreground",
		children: "نتیجه‌ای نیست."
	});
	const max = rows.reduce((m, r) => Math.max(m, r.tripCount), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-right text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "sticky top-0 z-10 bg-muted text-xs text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: "#"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: "نام"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: "نام خانوادگی"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: "شماره پرسنلی"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: "تعداد"
					}),
					Array.from({ length: max }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
						className: "px-3 py-2 font-medium",
						children: ["حرکت ", faNum(i + 1)]
					}, i))
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 tabular-nums text-muted-foreground",
						children: faNum(i + 1)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: row.firstName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 font-medium",
						children: row.lastName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 tabular-nums",
						children: row.personnelId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.unusual ? "warn" : "ok",
							children: faNum(row.tripCount)
						})
					}),
					Array.from({ length: max }, (_, idx) => {
						const trip = row.trips[idx];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 tabular-nums",
							children: trip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								title: `${roleLabel(trip.role)} · ${stationLabel(trip.origin)}`,
								children: [trip.time, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ms-1 text-xs text-muted-foreground",
									children: stationShort(trip.origin)
								})]
							}) : ""
						}, idx);
					})
				]
			}, `${row.personnelId}-${row.lastName}`)) })]
		})
	});
}
function DetailTable({ trips }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-[var(--radius-xl)] border border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[800px] text-right text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "sticky top-0 z-10 bg-muted text-xs text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
					"نوع",
					"کد",
					"نام",
					"نام خانوادگی",
					"مبدأ",
					"مقصد",
					"ساعت"
				].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-3 py-2 font-medium",
					children: h
				}, h)) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: trips.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: roleLabel(t.role)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 tabular-nums",
						children: t.personnelId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: t.firstName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 font-medium",
						children: t.lastName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: t.originRaw || stationLabel(t.origin)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: t.destRaw || stationLabel(t.dest)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 tabular-nums text-line",
						children: t.time
					})
				]
			}, `${t.sourceRow}-${i}`)) })]
		})
	});
}
function WarningsPanel({ result }) {
	if (result.warnings.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-[var(--radius-xl)] border border-border bg-surface p-6 text-sm text-muted-foreground",
		children: "کسری در ساعت‌های لوحه خروجی نیست. جفت راهبر و کمک‌راهبر کامل است."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2",
		children: result.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: w.level === "error" ? "danger" : w.level === "warn" ? "warn" : "default",
				children: w.level === "error" ? "خطا" : w.level === "warn" ? "هشدار" : "اطلاع"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ms-3",
				children: w.message
			})]
		}, `${w.code}-${i}`))
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoheApp, {});
}
//#endregion
export { Home as component };
