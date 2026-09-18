# Contrato de integração com o MNU Server

Este frontend consome `mnu-server`. As regras abaixo sintetizam os documentos
do backend e devem guiar telas, estados de carregamento, mensagens e cache.
Quando houver divergência, a documentação e o contrato da API do backend são a
fonte de verdade.

## Fronteiras do produto

| Superfície | Identificação | Autenticação |
| --- | --- | --- |
| Painel administrativo | contexto do JWT | JWT da loja |
| Cardápio público | `Store.slug` | não exige autenticação |
| Acompanhamento pessoal | `slug` + `shortId` opaco | não exige autenticação |

`storeId` é dado de tenancy e nunca pode ser enviado pelo frontend em payloads
administrativos. A API o obtém do JWT. Não exponha `storeId` em rotas públicas.

## Respostas e erros

A API devolve `{ success, data }` em sucesso e `{ success: false, error }` em
falhas. A camada `api` de cada feature deve desempacotar esse envelope e oferecer
à view um erro apropriado para apresentação. A view não interpreta códigos ou
envelopes HTTP diretamente.

- `400`: exiba uma orientação de correção quando a mensagem for segura.
- `401`: encerre ou recupere a sessão conforme a política de autenticação.
- `403`: informe que a ação não é permitida.
- `404`: use estado de recurso não encontrado.
- `409`: atualize os dados e explique que o estado mudou; não simule sucesso.
- `500`: mensagem genérica, preservando detalhes técnicos fora da interface.

Campos ausentes em atualizações parciais significam “não alterar”; `null` tem
semântica diferente. Formulários não devem enviar valores vazios por acidente.

## Pedidos: estado vem do servidor

O banco é a fonte de verdade dos pedidos. O frontend pode usar feedback otimista
somente se conseguir reconciliar a resposta; jamais deve avançar um cartão apenas
por uma transição imaginada localmente.

```text
PENDING → IN_PREPARATION → READY → FINISHED
   └──────────────────────────────────────→ CANCELED
```

`CANCELED` e `FINISHED` são terminais. Rejeitar exige `reason` para `PENDING`;
cancelar pela loja exige `reason` em `IN_PREPARATION` ou `READY`. O cliente só
cancela em `PENDING`. Uma transição inválida devolve `409`.

O painel deve carregar um snapshot REST ao abrir ou reconectar. No futuro, o
SSE autenticado deve ser aberto antes do snapshot; espere `stream.ready`, carregue
o REST e mantenha eventos em fila até o snapshot terminar. Eventos repetidos ou
antigos são descartados usando a `version` do pedido.

## Público, privacidade e navegação

- A loja pública é resolvida por `slug`; URLs pessoais usam `/:shortId` opaco.
- Histórico por telefone é uma conveniência do MVP, não uma autenticação forte.
  A interface deve explicar isso de forma clara.
- Para links pessoais, gere e guarde localmente um identificador aleatório do
  dispositivo e envie-o em `X-Device-Id`. Não use fingerprinting invasivo.
- Nunca exiba endereço completo no histórico consultado por telefone. A API já
  reduz esses dados, e o frontend não deve tentar reconstruí-los.
- Não coloque JWT, token de acesso do pedido ou `shortId` em logs, analytics ou
  mensagens de erro. O código temporário de onboarding deve continuar fora da URL.
- O navegador pode preencher credenciais via `autocomplete`, mas o frontend nunca
  armazena a senha. A opção de manter conexão guarda apenas o token até sua
  expiração; sem essa opção, ele fica limitado à sessão da aba.

## Estrutura de frontend

`src/app` compõe rotas e providers. Cada domínio em `src/features` separa `api`,
schemas, hooks, view-models e views. Views não fazem HTTP nem concentram regra de
negócio: elas consomem o view-model. Esta separação é obrigatória para manter o
fluxo do backend explícito e testável.
