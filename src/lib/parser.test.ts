import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseSpreadsheet } from "./parser";

describe("leitura da planilha Shein", () => {
  it("não exige colunas de frete", async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Número", "Data da venda", "Quantidade", "Descrição do produto", "Preço de custo atual", "Valor total da venda", "Comissão e-commerce"],
      ["S-1", "01/09/2026", 1, "Produto A", "10,00", "30,00", "3,00"],
    ]), "Pedidos");
    const file = new File([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], "shein.xlsx");

    const parsed = await parseSpreadsheet(file, "Olist 1", "shein");

    expect(parsed.items).toHaveLength(1);
    expect(parsed.issues.some((issue) => issue.severity === "critical")).toBe(false);
  });
});
