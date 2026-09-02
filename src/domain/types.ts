export type Channel = "mercado-livre-full" | "shopee";
export type Account = "Olist 1" | "Olist 2" | "Olist 3";
export type Severity = "info" | "warning" | "critical";
export type Issue = { severity: Severity; type: string; message: string; impact: string; file?: string; account?: Account; channel?: Channel; line?: number; orderNumber?: string; product?: string; field?: string; originalValue?: unknown };
export type Item = { file: string; account: Account; channel: Channel; orderNumber: string; saleDate?: string; externalOrder?: string; quantity: number; product: string; unitCostCents: number; saleCents?: number; commissionCents?: number; companyShippingCents?: number; customerShippingCents?: number; line: number };
export type Order = { key: string; orderNumber: string; account: Account; channel: Channel; file: string; date?: string; itemCount: number; revenueCents: number; cmvCents: number; commissionCents: number; shippingCents?: number; issues: boolean };
export type Summary = { revenueCents: number; cmvCents: number; commissionCents: number; shippingCents: number; resultCents: number; margin: number; orders: number; items: number; multiLineOrders: number; zeroCostLines: number; zeroCostOrders: number; review: boolean; channel?: Channel };
export type ParsedFile = { id: string; name: string; size: number; sheet: string; account: Account; channel: Channel; items: Item[]; issues: Issue[]; minDate?: string; maxDate?: string; preview: Record<string, unknown>[] };
