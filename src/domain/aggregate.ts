import { Channel, Issue, Item, Order, Summary } from "./types";

const SHEIN_SHIPPING_PER_LINE_CENTS = 400;

export function aggregate(items: Item[], channel?: Channel): { orders: Order[]; summary: Summary; issues: Issue[] } {
  const issues: Issue[] = [];
  const ordersByKey = new Map<string, Item[]>();

  for (const item of items) {
    if (!item.orderNumber) continue;
    const key = `${item.file}|${item.account}|${item.channel}|${item.orderNumber}`;
    ordersByKey.set(key, [...(ordersByKey.get(key) ?? []), item]);
  }

  const orders = [...ordersByKey.entries()].map(([key, rows]) => {
    const first = rows[0];
    const fieldsToValidate = first.channel === "mercado-livre-full"
      ? ["saleCents", "companyShippingCents", "customerShippingCents"] as const
      : ["saleCents"] as const;
    let hasDivergence = false;

    for (const field of fieldsToValidate) {
      if (new Set(rows.map((item) => item[field])).size <= 1) continue;
      hasDivergence = true;
      issues.push({
        severity: "critical",
        type: "Divergência no pedido",
        message: `Valores divergentes de ${field} no pedido`,
        impact: "Métrica de pedido provisória",
        file: first.file,
        account: first.account,
        channel: first.channel,
        orderNumber: first.orderNumber,
        field,
      });
    }

    const shippingCents = first.channel === "mercado-livre-full"
      ? (first.companyShippingCents ?? 0) - (first.customerShippingCents ?? 0)
      : first.channel === "shein"
        ? rows.length * SHEIN_SHIPPING_PER_LINE_CENTS
        : undefined;
    if ((shippingCents ?? 0) < 0) {
      issues.push({
        severity: "warning",
        type: "Frete negativo",
        message: "Frete pago pela empresa calculado negativo",
        impact: "Crédito preservado",
        file: first.file,
        account: first.account,
        channel: first.channel,
        orderNumber: first.orderNumber,
      });
    }

    return {
      key,
      orderNumber: first.orderNumber,
      account: first.account,
      channel: first.channel,
      file: first.file,
      date: first.saleDate,
      itemCount: rows.length,
      revenueCents: first.saleCents ?? 0,
      cmvCents: rows.reduce((sum, item) => sum + item.unitCostCents * item.quantity, 0),
      commissionCents: rows.reduce((sum, item) => sum + (item.commissionCents ?? 0), 0),
      shippingCents,
      issues: hasDivergence,
    };
  });

  const shown = channel ? orders.filter((order) => order.channel === channel) : orders;
  const total = (value: (order: Order) => number) => shown.reduce((sum, order) => sum + value(order), 0);
  const revenueCents = total((order) => order.revenueCents);
  const cmvCents = total((order) => order.cmvCents);
  const commissionCents = total((order) => order.commissionCents);
  const shippingCents = total((order) => order.shippingCents ?? 0);
  const resultCents = revenueCents - cmvCents - commissionCents - shippingCents;
  const shownItems = items.filter((item) => !channel || item.channel === channel);
  const zeroCostLines = shownItems.filter((item) => item.unitCostCents === 0);
  const zeroCostOrders = new Set(zeroCostLines.map((item) => item.orderNumber));

  return {
    orders: shown,
    issues,
    summary: {
      revenueCents,
      cmvCents,
      commissionCents,
      shippingCents,
      resultCents,
      margin: revenueCents ? resultCents / revenueCents * 100 : 0,
      orders: shown.length,
      items: shownItems.length,
      multiLineOrders: shown.filter((order) => order.itemCount > 1).length,
      zeroCostLines: zeroCostLines.length,
      zeroCostOrders: zeroCostOrders.size,
      review: issues.some((issue) => issue.severity === "critical"),
      channel,
    },
  };
}
