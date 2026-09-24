import { buildPrintSheet, shortageLabel, type PrintSheet } from "@/lib/lohe/print-sheet";
import type { ProcessResult } from "@/lib/lohe";

export function LohePrintSurface({ result }: { result: ProcessResult }) {
  const sheet = buildPrintSheet(result);
  return (
    <div className="lohe-print-sheet" aria-hidden="true">
      <PrintLoheTable sheet={sheet} />
    </div>
  );
}

export function PrintLoheTable({ sheet }: { sheet: PrintSheet }) {
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
            <td>{row.golR}</td>
            <td>{row.golT}</td>
            <td>{row.golH1}</td>
            <td>{row.tehTime}</td>
            <td>{row.tehR}</td>
            <td />
            <td>{row.tehH1}</td>
          </tr>
        ))}
        <tr className="lohe-print-kasri">
          <td className="lohe-print-vert" rowSpan={8} />
          <td>نام</td>
          <td className="lohe-print-vert" rowSpan={8}>
            {shortageLabel("evening", sheet.eveningShift)}
          </td>
          <td>نام</td>
          <td className="lohe-print-vert" rowSpan={8}>
            {shortageLabel("morning", sheet.morningShift)}
          </td>
          <td>نام</td>
          <td className="lohe-print-vert" rowSpan={8}>
            {shortageLabel("evening", sheet.eveningShift)}
          </td>
          <td>نام</td>
        </tr>
        {Array.from({ length: 7 }, (_, i) => (
          <tr key={`kasri-${i}`} className="lohe-print-kasri">
            <td />
            <td />
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
