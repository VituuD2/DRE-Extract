# Extrator DRE Olist

Dashboard local para consolidar exportações da Olist ERP. A planilha é lida no navegador: não há backend, banco, telemetria ou envio de nomes de clientes.

## Executar

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Abra `http://localhost:3000`, escolha a conta Olist e o canal antes de adicionar cada arquivo. A exportação cria `dre-olist.xlsx` com as abas Resumo, Pedidos, Itens e Pendências.

## Regras financeiras

- Mercado Livre + Full: faturamento e frete (`frete empresa - frete cliente`) são deduplicados por pedido; CMV (`custo unitário × quantidade`) e comissão são somados por item.
- Shopee: faturamento é deduplicado por pedido; CMV e comissão são por item; frete está incluído na comissão e nunca é abatido duas vezes.
- Valores são tratados internamente como centavos inteiros. Datas são aceitas apenas como `DD/MM/AAAA`.
- Divergências de valores de pedido, pedidos sem número e repetição entre arquivos deixam o resultado provisório. Custo zero é preservado, gera pendência e marca CMV incompleto.

## Estrutura

- `src/domain`: tipos, dinheiro, agregação e consolidação — motor sem React.
- `src/lib/parser.ts`: aliases de cabeçalhos, leitura XLS/XLSX/CSV e validações locais.
- `src/lib/export.ts`: relatório XLSX.
- `src/app`: interface responsiva e acessível.

## Adaptadores futuros

O tipo de canal e o motor foram separados da interface. Magalu, Shein e Site SoulBM não possuem regras implementadas: adicione um adaptador e testes quando suas regras forem confirmadas, sem alterar o agregador existente.

## Privacidade e deploy

Planilhas reais, `.env*`, artefatos e dependências estão no `.gitignore`; não versione exportações com dados de clientes. O app pode ser implantado diretamente na Vercel como projeto Next.js, sem configurar variáveis de ambiente. Como todo o processamento é client-side, os dados não passam por funções Vercel.
