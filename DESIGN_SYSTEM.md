# Design system — Extrator DRE

## Princípios

Interface financeira calma e precisa: superfícies claras, hierarquia tipográfica curta, sem gradientes decorativos e com estados sempre acompanhados de texto.

## Tokens

Os tokens semânticos estão centralizados em `src/app/globals.css`: superfícies, textos, bordas, estados, cores de canal, raios, sombra e largura máxima. Espaçamentos usam múltiplos de 4px; números usam `tabular-nums`.

## Componentes

`src/components/ui` fornece Button (primary, secondary, ghost, destructive e icon), IconButton, Input, Select, Checkbox, Tabs, StatusBadge, Card, FileDropzone, MetricCard, EmptyState, ErrorBanner, Skeleton, Tooltip, Dialog, Drawer e Toast.

Use variantes semânticas. Por exemplo: `StatusBadge tone="warning"`, nunca uma cor local para comunicar aviso; e `Button variant="destructive"` para remoções.

## Acessibilidade e responsividade

Controles têm área mínima de 44px, foco com anel azul e contraste AA. Tabelas têm contêiner rolável e primeira coluna fixa. A animação é curta e removida com `prefers-reduced-motion`.
