import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { weekdayFromJalali } from "./jalali";
import { processWorkbook, processTrips } from "./process";
import { classifyRole, parseTimeToMinutes } from "./normalize";
import { buildDriverReport } from "./driver-report";
import { buildExportWorkbook } from "./export-workbook";
import type { Trip } from "./types";

describe("lohe engine", () => {
  it("classifies roles with Arabic/Persian letters and aliases", () => {
    assert.equal(classifyRole("راهبر"), "master");
    assert.equal(classifyRole("كمك راهبر"), "slave");
    assert.equal(classifyRole("کمک‌راهبر"), "slave");
    assert.equal(classifyRole("راهبر کمکی"), "slave");
    assert.equal(classifyRole("راهبر اصلی"), "master");
    assert.equal(classifyRole("مستر"), "master");
    assert.equal(classifyRole("اسلیو"), "slave");
    assert.equal(classifyRole("راهبر آموزشي"), "trainee");
  });

  it("pads times and reads excel serials without timezone shift", () => {
    assert.equal(parseTimeToMinutes("5:20")?.time, "05:20");
    assert.equal(parseTimeToMinutes("05:20")?.time, "05:20");
    const serial = parseTimeToMinutes(5 / 24 + 20 / (24 * 60));
    assert.equal(serial?.time, "05:20");
    const utcDate = new Date(Date.UTC(1899, 11, 30, 5, 20, 0));
    assert.equal(parseTimeToMinutes(utcDate)?.time, "05:20");
  });

  it("detects jalali weekday for 1402/03/03 as Wednesday", () => {
    const w = weekdayFromJalali("1402/03/03");
    assert.ok(w);
    assert.equal(w.name, "چهارشنبه");
    assert.equal(w.dayKind, "weekday");
  });

  it("parses the sample daily report and matches master/slave to output hours", async () => {
    const buf = readFileSync("/workspace/public/samples/gozaresh-avaliye.xls");
    const result = await processWorkbook(buf, "اولیه 3.xls", "auto");

    assert.equal(result.dayKind, "weekday");
    assert.ok(result.stats.namedTripCount >= 330);
    assert.ok(result.stats.driverCount >= 90);

    const g0520 = result.slots.find((s) => s.origin === "golshahr" && s.time === "05:20");
    assert.ok(g0520);
    assert.equal(g0520.vacantMaster, false);
    assert.equal(g0520.vacantSlave, false);
    assert.ok(g0520.masters[0]?.lastName.includes("امیری") || g0520.masters[0]?.lastName.includes("اميري"));
    assert.ok(
      g0520.slaves[0]?.lastName.includes("حسین زاده") || g0520.slaves[0]?.lastName.includes("حسين زاده"),
    );

    const t0530 = result.slots.find((s) => s.origin === "tehran" && s.time === "05:30");
    assert.ok(t0530);
    assert.equal(t0530.masters[0]?.lastName.includes("آجورلو"), true);

    const golTimes = new Set(result.slots.filter((s) => s.origin === "golshahr").map((s) => s.time));
    assert.equal(golTimes.has("05:20"), true);
    assert.equal(golTimes.has("09:15"), false);

    const lastNames = result.drivers.map((d) => d.lastName);
    const sorted = [...lastNames].sort((a, b) => a.localeCompare(b, "fa"));
    assert.deepEqual(lastNames, sorted);

    const typical = result.drivers.filter((d) => d.tripCount >= 2 && d.tripCount <= 8);
    assert.ok(typical.length > result.drivers.length * 0.8);

    assert.equal(result.stats.vacantSlots, 0);

    const onlyCrew = result.drivers.every((d) =>
      d.trips.every((t) => t.role === "master" || t.role === "slave"),
    );
    assert.equal(onlyCrew, true);

    const amiri = result.drivers.find((d) => d.personnelId === "99385");
    assert.ok(amiri);
    assert.ok(amiri.tripCount >= 2);
    assert.equal(amiri.trips[0]?.time, amiri.trips.map((t) => t.time).sort()[0]);
  });

  it("sorts driver report by last name and lists times one by one", () => {
    const trips: Trip[] = [
      {
        role: "master",
        roleRaw: "راهبر",
        personnelId: "2",
        firstName: "علی",
        lastName: "محمدی",
        origin: "golshahr",
        originRaw: "گلشهر",
        dest: "tehran",
        destRaw: "تهران",
        time: "08:00",
        minutes: 480,
        date: "1402/03/03",
        sourceRow: 1,
      },
      {
        role: "slave",
        roleRaw: "کمک راهبر",
        personnelId: "1",
        firstName: "رضا",
        lastName: "احمدی",
        origin: "tehran",
        originRaw: "تهران",
        dest: "golshahr",
        destRaw: "گلشهر",
        time: "06:00",
        minutes: 360,
        date: "1402/03/03",
        sourceRow: 2,
      },
      {
        role: "master",
        roleRaw: "راهبر",
        personnelId: "1",
        firstName: "رضا",
        lastName: "احمدی",
        origin: "golshahr",
        originRaw: "گلشهر",
        dest: "tehran",
        destRaw: "تهران",
        time: "07:00",
        minutes: 420,
        date: "1402/03/03",
        sourceRow: 3,
      },
      {
        role: "trainee",
        roleRaw: "راهبر آموزشی",
        personnelId: "9",
        firstName: "نادر",
        lastName: "آموزشی",
        origin: "golshahr",
        originRaw: "گلشهر",
        dest: "tehran",
        destRaw: "تهران",
        time: "06:00",
        minutes: 360,
        date: "1402/03/03",
        sourceRow: 4,
      },
    ];
    const rows = buildDriverReport(trips);
    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.lastName, "احمدی");
    assert.deepEqual(
      rows[0]?.trips.map((t) => t.time),
      ["06:00", "07:00"],
    );
    assert.equal(rows[1]?.lastName, "محمدی");
  });

  it("processTrips keeps meta and fills weekday template", async () => {
    const buf = readFileSync("/workspace/public/samples/gozaresh-avaliye.xls");
    const result = await processWorkbook(buf, "sample.xls");
    const again = processTrips(result.trips, result.meta, "weekday");
    assert.equal(again.stats.filledCrewPairs, again.slots.length);
    const wb = await buildExportWorkbook(again);
    assert.deepEqual(
      wb.SheetNames,
      ["پردازش", "گزارش راهبران", "جزئیات اعزام", "هشدارها"],
    );
  });

  it("rejects the empty lohe template as a daily report", async () => {
    const buf = readFileSync("/workspace/attachments/لوحه ساز نرم افزار سير و اعزام.xlsm");
    await assert.rejects(() => processWorkbook(buf, "template.xlsm"), /اعزام|شناخته نشد|لوحه خالی/);
  });
});
