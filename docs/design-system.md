# Sistema de design — MNU

## Propósito

O MNU começa com um tema claro, operacional e discreto. A interface deve ajudar
quem está trabalhando com pedidos a entender o estado atual e agir rapidamente;
a marca aparece pelo roxo, não por superfícies excessivamente coloridas.

Este documento define a base compartilhada. Ele não transforma cada tela em uma
composição de componentes genéricos: componentes próprios são desejáveis quando
encapsulam um padrão real do produto, como um card de pedido, um indicador de
status ou uma escolha de adicionais.

## Fonte de verdade

Os tokens vivem em `src/app/globals.css`. Componentes usam tokens semânticos
Tailwind (`bg-background`, `text-foreground`, `border-border`, `bg-primary`),
nunca valores hexadecimais soltos.

| Papel | Token | Valor atual |
| --- | --- | --- |
| Fundo da aplicação | `background` | `#faf9f9` |
| Borda padrão | `border` | `#e7e5e4` |
| Ação principal | `primary` | `#7c3aed` |
| Hover da ação principal | `primary-hover` | `#6d28d9` |
| Texto principal | `foreground` | `#1c1917` |
| Superfície elevada | `card` | `#ffffff` |
| Texto secundário | `muted-foreground` | `#78716c` |
| Erro/destrutivo | `destructive` | `#dc2626` |

O tema escuro não faz parte do escopo atual. Quando entrar no produto, os tokens
devem ser revisados por contraste e por cada estado operacional; não basta
inverter as cores.

## Regras de composição

- Use `src/components/ui` para primitivas de interação: botão, campo, label,
  card e futuros primitives do Shadcn/Base UI.
- Crie componentes em `src/features/<domínio>/components` quando o padrão tiver
  linguagem e comportamento próprios do MNU. Não os coloque em `ui` apenas por
  serem reutilizáveis.
- Uma ação primária por contexto é a regra. Use `primary` para a ação que move o
  fluxo; ações secundárias devem ser `outline`, `secondary` ou `ghost`.
- `destructive` só representa uma ação irreversível, bloqueio ou erro. Status
  operacional de pedido terá tokens próprios quando o kanban for implementado.
- Estados de foco devem permanecer visíveis: as primitivas usam `ring`, hoje
  alinhado ao roxo da marca. Não remova `focus-visible`.
- Mantenha o conteúdo em superfícies neutras. O roxo pode sinalizar navegação,
  seleção e chamada para ação, mas não deve preencher grandes áreas sem motivo.

## Espaçamento, forma e tipografia

- A escala padrão do Tailwind é a escala de espaçamento do produto; evite valores
  arbitrários quando um passo da escala resolve.
- O raio-base é `0.625rem`. Cards usam `rounded-xl`; controles usam `rounded-lg`.
- Montserrat é a fonte de interface. Use pesos e tamanhos para criar hierarquia antes
  de recorrer a cor. Texto auxiliar deve usar `text-muted-foreground`.
- Em telas operacionais, dê preferência a títulos curtos, metadados legíveis e
  áreas de toque generosas. Informação de tempo, status e próximo passo deve ser
  identificável sem depender apenas da cor.

## Evolução dos tokens

Para adicionar uma cor ou token novo:

1. descreva o papel semântico, não a aparência (por exemplo, `order-ready`, não
   `green-500`);
2. defina-o em `globals.css` e exponha-o em `@theme inline` se precisar de uma
   utility Tailwind;
3. documente contraste, estados de hover/foco e os contextos permitidos aqui;
4. atualize componentes existentes que expressem aquele mesmo papel.

Não crie uma nova cor para resolver um caso isolado de tela.
