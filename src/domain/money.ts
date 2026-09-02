export const formatMoney = (cents = 0) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
export const parseMoney = (value: unknown): number | undefined => {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 100) : undefined;
  if (typeof value !== "string") return value == null || value === "" ? undefined : undefined;
  let raw = value.trim().replace(/R\$|\s/g, ""); if (!raw) return undefined;
  const negative = raw.startsWith("-") || /^\(.*\)$/.test(raw); raw = raw.replace(/[()-]/g, "");
  const comma = raw.lastIndexOf(","), dot = raw.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) raw = comma > dot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  else if (comma >= 0) raw = raw.replace(/\./g, "").replace(",", ".");
  else if ((raw.match(/\./g) || []).length > 1) raw = raw.replace(/\./g, "");
  if (!/^\d+(\.\d+)?$/.test(raw)) return undefined;
  const cents = Math.round(Number(raw) * 100); return negative ? -cents : cents;
};
export const parseDate = (value: unknown): string | undefined => { const s = String(value ?? "").trim(); const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s); if (!m) return undefined; const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])); return d.getUTCFullYear() === +m[3] && d.getUTCMonth() === +m[2]-1 && d.getUTCDate() === +m[1] ? s : undefined; };
