import * as XLSX from "xlsx";
import { aggregate } from "@/domain/aggregate";
import type { Channel, Issue, Item, Order, Summary } from "@/domain/types";

const channels: Channel[] = ["mercado-livre-full", "shopee", "shein"];
const labels: Record<Channel, string> = { "mercado-livre-full": "Mercado Livre", shopee: "Shopee", shein: "Shein" };
const sheetPrefix: Record<Channel, string> = { "mercado-livre-full": "ML", shopee: "Shopee", shein: "Shein" };
const money = (cents: number | undefined) => (cents ?? 0) / 100;

export function exportReport(_summary: Summary, orders: Order[], items: Item[], issues: Issue[]) {
  const workbook = XLSX.utils.book_new();
  const add = (name: string, data: Record<string, unknown>[]) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), name);
  const active = channels.filter(channel => items.some(item => item.channel === channel));

  add("Resumo por canal", active.flatMap(channel => [...new Set(items.filter(item => item.channel === channel).map(item => item.account))].map(account => {
    const summary = aggregate(items.filter(item => item.channel === channel && item.account === account), channel).summary;
    return { "Conta Olist": account, Marketplace: labels[channel], Faturamento: money(summary.revenueCents), CMV: money(summary.cmvCents), Comissão: money(summary.commissionCents), "Frete pago empresa": channel === "shopee" ? "Incluído na comissão" : money(summary.shippingCents), Resultado: money(summary.resultCents), "Margem (%)": summary.margin, Pedidos: summary.orders, Itens: summary.items };
  })));

  for (const channel of active) {
    const prefix = sheetPrefix[channel]; const marketOrders = orders.filter(order => order.channel === channel); const marketItems = items.filter(item => item.channel === channel); const marketIssues = issues.filter(issue => issue.channel === channel);
    add(`${prefix} Pedidos`, marketOrders.map(order => ({ Pedido: order.orderNumber, Conta: order.account, Data: order.date, Faturamento: money(order.revenueCents), CMV: money(order.cmvCents), Comissão: money(order.commissionCents), "Frete pago empresa": channel === "shopee" ? "Incluído na comissão" : money(order.shippingCents), Itens: order.itemCount })));
    add(`${prefix} Itens`, marketItems.map(item => ({ Pedido: item.orderNumber, Conta: item.account, Data: item.saleDate, Produto: item.product, Quantidade: item.quantity, "Custo unitário": money(item.unitCostCents), Comissão: money(item.commissionCents) })));
    add(`${prefix} Pendências`, marketIssues.map(issue => ({ Severidade: issue.severity, Tipo: issue.type, "Conta Olist": issue.account, Arquivo: issue.file, Pedido: issue.orderNumber, Linha: issue.line, Campo: issue.field, Mensagem: issue.message, Impacto: issue.impact })));
  }
  XLSX.writeFile(workbook, "dre-olist.xlsx");
}
