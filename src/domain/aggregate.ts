import { Channel, Issue, Item, Order, Summary } from "./types";
export function aggregate(items: Item[], channel?: Channel): { orders: Order[]; summary: Summary; issues: Issue[] } {
  const issues: Issue[] = []; const map = new Map<string, Item[]>();
  for (const item of items) { if (!item.orderNumber) continue; const key = `${item.file}|${item.account}|${item.channel}|${item.orderNumber}`; map.set(key, [...(map.get(key) ?? []), item]); }
  const orders = [...map.entries()].map(([key, rows]) => {
    const first = rows[0]; const prop = (name: "saleCents" | "companyShippingCents" | "customerShippingCents") => rows.map(x => x[name]);
    let bad = false; for (const field of ["saleCents", "companyShippingCents", "customerShippingCents"] as const) { const values = prop(field); if (new Set(values).size > 1) { bad = true; issues.push({ severity: "critical", type: "Divergência no pedido", message: `Valores divergentes de ${field} no pedido`, impact: "Métrica de pedido provisória", file: first.file, account: first.account, channel: first.channel, orderNumber: first.orderNumber, field }); } }
    const revenue = first.saleCents ?? 0, shipping = first.channel === "mercado-livre-full" ? (first.companyShippingCents ?? 0) - (first.customerShippingCents ?? 0) : undefined;
    if ((shipping ?? 0) < 0) issues.push({ severity: "warning", type: "Frete negativo", message: "Frete pago pela empresa calculado negativo", impact: "Crédito preservado", file: first.file, account: first.account, channel: first.channel, orderNumber: first.orderNumber });
    return { key, orderNumber: first.orderNumber, account: first.account, channel: first.channel, file: first.file, date: first.saleDate, itemCount: rows.length, revenueCents: revenue, cmvCents: rows.reduce((s,x)=>s+x.unitCostCents*x.quantity,0), commissionCents: rows.reduce((s,x)=>s+(x.commissionCents ?? 0),0), shippingCents: shipping, issues: bad };
  });
  const shown = channel ? orders.filter(o => o.channel === channel) : orders; const total = (fn: (o: Order)=>number) => shown.reduce((s,o)=>s+fn(o),0);
  const revenueCents=total(o=>o.revenueCents), cmvCents=total(o=>o.cmvCents), commissionCents=total(o=>o.commissionCents), shippingCents=total(o=>o.shippingCents ?? 0), resultCents=revenueCents-cmvCents-commissionCents-shippingCents;
  const shownItems = items.filter(i => !channel || i.channel === channel); const zero = shownItems.filter(i=>i.unitCostCents===0); const zeroOrders=new Set(zero.map(i=>i.orderNumber));
  return { orders: shown, issues, summary: { revenueCents,cmvCents,commissionCents,shippingCents,resultCents,margin: revenueCents ? resultCents/revenueCents*100 : 0,orders:shown.length,items:shownItems.length,multiLineOrders:shown.filter(o=>o.itemCount>1).length,zeroCostLines:zero.length,zeroCostOrders:zeroOrders.size,review:issues.some(i=>i.severity==="critical"),channel } };
}
