# Frontend architecture

## Domain-first structure

The frontend follows the same business-domain boundaries as the backend. A feature
directory names a domain, not a UI technique or a single screen.

```text
src/
  app/                         # Routes, layouts, providers, redirects
  components/ui/               # Shared UI primitives
  features/
    auth/
    dashboard/
    menu/
      imports/
      categories/
      products/
      modifier-groups/
    orders/
    public/
      menu/
    store/
```

`features/menu` owns authenticated menu administration. `features/public` owns
unauthenticated customer-facing flows. Do not create parallel feature roots such
as `menu-imports` or `public-menu`.

## Files within a domain

Use only folders justified by the domain:

```text
features/menu/imports/
  api/
  schemas/
  hooks/
  view-models/
  views/
  components/
```

- `api`: HTTP boundary and request/response mapping.
- `schemas`: Zod schemas and inferred types.
- `hooks`: reusable React Query or React hooks.
- `view-models`: state and interaction orchestration for complex views.
- `views`: route-level domain composition.
- `components`: reusable domain UI with a clear responsibility.

`src/app` composes a route from a view. It must not own API calls, schemas, hooks,
or business rules.

## Naming and component boundaries

- All filenames, component names, functions, variables, and types are English.
- User-facing copy may be Portuguese. URL segments may be Portuguese when that is
  the product decision.
- Do not extract static titles, small text blocks, or one-off markup into their
  own component.
- Extract a component only when it is reused, owns state or interaction, or is a
  substantial domain visual such as an order card or product editor.
