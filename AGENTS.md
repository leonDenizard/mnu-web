<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Frontend architecture

Organize `src/modules` by business domain, mirroring the backend module boundary.

- Use `modules/menu` for authenticated menu administration. Subdomains belong below it, for example `imports`, `categories`, `products`, and `modifier-groups`.
- Use `modules/public` for unauthenticated experiences. Public menu code belongs in `modules/public/menu`.
- Keep `src/app` limited to route composition, layouts, providers, and route-level redirects. Do not put domain API clients, schemas, hooks, or view models there.
- Use `components/ui` only for generic visual primitives. Shared authenticated shells, navigation, and other app structure belong in `components/layout`, not in a `modules/dashboard` domain.
- Inside a domain, use only the folders the domain needs: `api`, `schemas`, `hooks`, `view-models`, `views`, and `components`.
- File names, component names, functions, types, and variables must be in English. User-facing copy and URL segments may remain Portuguese when that is the product decision.
- Do not split static headings, short text blocks, or one-off markup into components. Extract a component only for a reusable domain element, a self-contained interaction/state, or a substantial visual unit.
