import { buildPrintSheet, shortageLabel, type PrintSheet } from "@/lib/lohe/print-sheet";
import type { KasriResult } from "@/lib/lohe/kasri";
import type { ShiftDuty } from "@/lib/lohe/personnel";
import type { ProcessResult } from "@/lib/lohe";

export function LohePrintSurface({
  result,
  duty,
  kasri,
}: {
  result: ProcessResult;
  duty?: ShiftDuty;
  kasri?: KasriResult | null;
}) {
  const sheet = buildPrintSheet(result, { duty, kasri });
  return (
    <div className="lohe-print-sheet" aria-hidden="true">
      <PrintLoheTable sheet={sheet} />
    </div>
  );
}

function NamedCell({ value, overtimeNames }: { value: string; overtimeNames: string[] }) {
  if (!value) return null;
  const parts = value.split(" / ").filter(Boolean);
  return (
    <>
      {parts.map((name, i) => {
        const ot = overtimeNames.includes(name);
        return (
          <span key={`${name}-${i}`}>
            {i > 0 ? " / " : null}
            <span className={ot ? "lohe-ot" : undefined}>{name}</span>
          </span>
        );
      })}
    </>
  );
}

export function PrintLoheTable({ sheet }: { sheet: PrintSheet }) {
  const footerRows = Math.max(8, sheet.morningShortage.length + 1, sheet.eveningShortage.length + 1, 1);
  return (
    <table className="lohe-print-table" dir="rtl">
      <thead>
        <tr>
          <th>شیفت صبح</th>
          <th>{sheet.morningShift}</th>
          <th />
          <th />
          <th>شیفت عصر</th>
          <th>{sheet.eveningShift}</th>
          <th />
          <th />
        </tr>
        <tr>
          <th />
          <th colSpan={3}>گلشهر</th>
          <th>{sheet.date ? `تاریخ ${sheet.date}` : "تاریخ"}</th>
          <th colSpan={3}>تهران - صادقیه</th>
        </tr>
        <tr>
          <th>زمان حرکت</th>
          <th>R</th>
          <th>T</th>
          <th>H1</th>
          <th>زمان حرکت</th>
          <th>R</th>
          <th>{sheet.weekday || "روز هفته"}</th>
          <th>H1</th>
        </tr>
      </thead>
      <tbody>
        {sheet.rows.map((row, i) => (
          <tr key={`${row.golTime}-${row.tehTime}-${i}`} className={!row.golTime && !row.tehTime ? "lohe-print-gap" : undefined}>
            <td>{row.golTime}</td>
            <td>
              <NamedCell value={row.golR} overtimeNames={sheet.overtimeNames} />
            </td>
            <td>{row.golT}</td>
            <td>
              <NamedCell value={row.golH1} overtimeNames={sheet.overtimeNames} />
            </td>
            <td>{row.tehTime}</td>
            <td>
              <NamedCell value={row.tehR} overtimeNames={sheet.overtimeNames} />
            </td>
            <td />
            <td>
              <NamedCell value={row.tehH1} overtimeNames={sheet.overtimeNames} />
            </td>
          </tr>
        ))}
        <tr className="lohe-print-kasri">
          <td className="lohe-print-vert" rowSpan={footerRows} />
          <td>نام</td>
          <td className="lohe-print-vert" rowSpan={footerRows}>
            {shortageLabel("evening", sheet.eveningShift)}
          </td>
          <td>نام</td>
          <td className="lohe-print-vert" rowSpan={footerRows}>
            {shortageLabel("morning", sheet.morningShift)}
          </td>
          <td>نام</td>
          <td className="lohe-print-vert" rowSpan={footerRows}>
            {shortageLabel("evening", sheet.eveningShift)}
          </td>
          <td>نام</td>
        </tr>
        {Array.from({ length: footerRows - 1 }, (_, i) => (
          <tr key={`kasri-${i}`} className="lohe-print-kasri">
            <td>{sheet.eveningShortage[i] ?? ""}</td>
            <td>{sheet.morningShortage[i] ?? ""}</td>
            <td />
            <td />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function printLohe() {
  window.print();
}
