import type * as XLSXNS from "xlsx";

export type XLSXModule = typeof XLSXNS;

/** Browser-safe lazy load — never import `xlsx` at module top-level. */
export async function loadXlsx(): Promise<XLSXModule> {
  const mod = await import("xlsx");
  const ns = mod as XLSXModule & { default?: XLSXModule };
  return ns.default ?? ns;
}
