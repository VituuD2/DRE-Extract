import * as XLSX from "xlsx";
import { parseDate, parseMoney } from "../domain/money";
import { Account, Channel, Issue, Item, ParsedFile } from "../domain/types";

const norm = (value: unknown) => String(value ?? "")
  .replace(/^\uFEFF/, "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/\s+/g, " ");

const aliases: Record<string, string[]> = {
  orderNumber: ["numero", "numero do pedido"],
  saleDate: ["data da venda", "data venda"],
  quantity: ["quantidade de produtos", "quantidade"],
  product: ["descricao do produto", "produto"],
  unitCostCents: ["preco de custo atual", "preco custo"],
  saleCents: ["valor total da venda", "total da venda"],
  commissionCents: ["comissao e-commerce", "comissao ecommerce"],
  companyShippingCents: ["frete pago pela empresa"],
  customerShippingCents: ["frete pago pelo cliente"],
  externalOrder: ["numero do pedido no e-commerce", "numero pedido ecommerce"],
};

const requiredFields = (channel: Channel) => [
  "orderNumber",
  "saleDate",
  "quantity",
  "product",
  "unitCostCents",
  "saleCents",
  "commissionCents",
  ...(channel === "mercado-livre-full" ? ["companyShippingCents", "customerShippingCents"] : []),
];

function mapping(header: unknown[]) {
  const headers = header.map(norm);
  const output: Record<string, number> = {};
  for (const [field, names] of Object.entries(aliases)) {
    const index = headers.findIndex((header) => names.includes(header));
    if (index >= 0) output[field] = index;
  }
  return output;
}

const value = (row: unknown[], fields: Record<string, number>, key: string) =>
  fields[key] === undefined ? undefined : row[fields[key]];

export async function parseSpreadsheet(file: File, account: Account, channel: Channel): Promise<ParsedFile> {
  const bytes = await file.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)))
    .map((number) => number.toString(16).padStart(2, "0"))
    .join("");
  const book = XLSX.read(bytes, { type: "array", cellDates: false });
  const candidates = book.SheetNames
    .map((sheet) => {
      const rows = XLSX.utils.sheet_to_json<unknown[]>(book.Sheets[sheet], { header: 1, defval: "", raw: false });
      return { sheet, rows, fields: mapping(rows[0] ?? []) };
    })
    .filter((sheet) => requiredFields(channel).every((field) => sheet.fields[field] !== undefined));
  const issues: Issue[] = [];

  if (!candidates.length) {
    return {
      id: digest,
      name: file.name,
      size: file.size,
      sheet: "—",
      account,
      channel,
      items: [],
      issues: [{ severity: "critical", type: "Cabeçalho", message: "Aba com cabeçalhos exigidos não encontrada", impact: "Arquivo não processado", file: file.name, account, channel }],
      preview: [],
    };
  }

  const chosen = candidates[0];
  if (candidates.length > 1) {
    issues.push({ severity: "warning", type: "Aba ambígua", message: `${candidates.length} abas compatíveis; usada ${chosen.sheet}`, impact: "Confira a aba selecionada", file: file.name, account, channel });
  }
  if (chosen.rows.length < 2) {
    issues.push({ severity: "critical", type: "Aba vazia", message: "A planilha não possui linhas de dados", impact: "Sem cálculos", file: file.name, account, channel });
  }

  const items: Item[] = [];
  for (let index = 1; index < chosen.rows.length; index++) {
    const row = chosen.rows[index];
    if (!row.some((cell) => String(cell).trim())) continue;
    const line = index + 1;
    const base = { file: file.name, account, channel, line };
    const orderNumber = String(value(row, chosen.fields, "orderNumber") ?? "").trim();
    const product = String(value(row, chosen.fields, "product") ?? "").trim();
    const saleDate = parseDate(value(row, chosen.fields, "saleDate"));
    const quantityRaw = String(value(row, chosen.fields, "quantity") ?? "").trim();
    const quantity = Number(quantityRaw);
    const money = (field: string, required = true) => {
      const raw = value(row, chosen.fields, field);
      const parsed = parseMoney(raw);
      if (required && parsed === undefined) {
        issues.push({ severity: "critical", type: "Valor inválido", message: `${field} vazio ou inválido`, impact: "Linha excluída dos cálculos", ...base, orderNumber, product, field, originalValue: raw });
      }
      return parsed;
    };

    if (!orderNumber) issues.push({ severity: "critical", type: "Pedido ausente", message: "Número do pedido vazio", impact: "Excluído das métricas por pedido", ...base, product });
    if (!saleDate) issues.push({ severity: "warning", type: "Data inválida", message: "Data ausente ou fora de DD/MM/AAAA", impact: "Período pode ficar incompleto", ...base, orderNumber, product, field: "Data da venda" });
    if (!Number.isInteger(quantity) || quantity <= 0) issues.push({ severity: "critical", type: "Quantidade inválida", message: "Quantidade deve ser inteiro positivo", impact: "CMV inválido", ...base, orderNumber, product, field: "Quantidade", originalValue: quantityRaw });

    const unitCostCents = money("unitCostCents");
    const saleCents = money("saleCents");
    const commissionCents = money("commissionCents");
    const companyShippingCents = money("companyShippingCents", channel === "mercado-livre-full");
    const customerShippingCents = money("customerShippingCents", channel === "mercado-livre-full");
    const valid = orderNumber
      && Number.isInteger(quantity)
      && quantity > 0
      && unitCostCents !== undefined
      && saleCents !== undefined
      && commissionCents !== undefined
      && (channel !== "mercado-livre-full" || (companyShippingCents !== undefined && customerShippingCents !== undefined));

    if (unitCostCents === 0) issues.push({ severity: "warning", type: "Custo zero", message: "CMV incompleto: custo unitário R$ 0,00", impact: "Resultado provisório", ...base, orderNumber, product, field: "Preço de custo atual" });
    if (valid) {
      items.push({
        ...base,
        orderNumber,
        product,
        quantity,
        unitCostCents,
        saleDate,
        saleCents,
        commissionCents,
        companyShippingCents,
        customerShippingCents,
        externalOrder: String(value(row, chosen.fields, "externalOrder") ?? ""),
      });
    }
  }

  const dates = items
    .map((item) => item.saleDate)
    .filter((date): date is string => !!date)
    .sort((first, second) => first.split("/").reverse().join("").localeCompare(second.split("/").reverse().join("")));
  if (dates.length && dates[0].slice(3) !== dates.at(-1)?.slice(3)) {
    issues.push({ severity: "warning", type: "Período múltiplo", message: `Arquivo contém ${dates[0]} a ${dates.at(-1)}`, impact: "Confira o período", file: file.name, account, channel });
  }

  return {
    id: digest,
    name: file.name,
    size: file.size,
    sheet: chosen.sheet,
    account,
    channel,
    items,
    issues,
    minDate: dates[0],
    maxDate: dates.at(-1),
    preview: chosen.rows.slice(1, 6).map((row) => Object.fromEntries(Object.entries(chosen.fields).map(([field, index]) => [field, field === "product" ? "Produto mascarado" : row[index]]))),
  };
}
