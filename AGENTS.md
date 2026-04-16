# bigtablet-cafe-monorepo-web

## Project Structure

This is a pnpm monorepo with three workspaces:

- `apps/customer` — Mobile-only customer ordering app (port 3000)
- `apps/admin` — Desktop admin management portal (port 3001)
- `packages/shared` — Shared utilities, hooks, schemas, API client

Stack: Next.js 16, React 19, App Router, TypeScript, SCSS Modules, Biome.

## Architecture: Feature-Sliced Design (FSD)

Layer hierarchy (upper may only import from lower):
1. `app` — Next.js routes, layouts, providers
2. `widgets` — Composite UI blocks
3. `features` — User interactions (query, mutation, model, ui, store)
4. `entities` — Domain models (api, schema, constants)
5. `shared` — Reusable utilities, hooks, UI primitives

Rules:
- Never import upward (e.g. entities must not import from features)
- Never import across slices within the same layer
- API definitions: `entities/{name}/api/`
- Query/Mutation hooks: `features/{name}/query/`, `features/{name}/mutation/`

## Coding Standards

### Exports
- Always `export default` with arrow functions. No named exports for components.

### Imports
- Absolute paths only: `src/features/...`, `@bigtablet/shared/...`
- No relative paths (except same directory)
- `@shared/*` alias: customer app only

### SCSS Styling
- Use `@use "@bigtablet/design-system/scss/token" as token` (required)
- Never use `@import` (deprecated)
- All colors/spacing/typography via DS tokens: `token.$color-*`, `token.$spacing-*`, `token.text-*`
- No hardcoded values, no inline styles
- Class names: snake_case

### React
- `"use client"` at boundary entry points only (children inherit)
- Icons: `lucide-react` (not `@iconify/react`)
- Images: `next/image` (not `<img>`)

### Data Layer
- Schema: Zod with `z.infer<typeof schema>` for types
- Server state: React Query with `queryOptions` factory
- Client state: Zustand (actions separated)
- Forms: react-hook-form + zodResolver

## Linting & Formatting

Tool: Biome
- Indentation: tabs (width 2)
- Line width: 100
- `apps/customer/`: a11y rules disabled (mobile-only)
- `apps/admin/`: a11y rules strict (desktop)

Run: `pnpm format && pnpm lint`

## Testing

Framework: Vitest
- Run all: `pnpm test`
- Run with coverage: `pnpm test:coverage`
- Component tests use `@testing-library/react`

## Git & PR Conventions

Commit format: `type: subject`
- Allowed types: feat, fix, bug, merge, deploy, docs, delete, note, style, config, chore, test, etc, tada
- Max header: 100 characters
- Branch: feat/*, fix/*, hotfix/*

PR messages should summarize changes by file group and note any convention deviations.

## Build & Deploy

- `pnpm build` — Build all apps (Turborepo)
- Output: standalone (Docker-ready)
- CI: GitHub Actions (lint → typecheck → build matrix [customer, admin])

## Scaffolding: New Feature Slice

When creating a new feature (e.g. "order"), generate the full FSD structure:

```
entities/{name}/
  ├── api/{name}.api.ts          — Axios API functions
  ├── schema/{name}.schema.ts    — Zod schemas + z.infer types
  └── constants/

features/{name}/
  ├── query/{name}.query.ts      — queryOptions factory
  ├── mutation/{name}.mutation.ts — useMutation hooks
  ├── model/{name}.schema.ts     — Feature-level Zod schemas
  ├── store/use-{name}-store.ts  — Zustand store (if client state needed)
  └── ui/                        — React components
```

## Scaffolding: New Component

When creating a component, always generate two files:
1. `index.tsx` — `export default` arrow function, `"use client"` only if hooks/events used
2. `style.module.scss` — starts with `@use "@bigtablet/design-system/scss/token" as token`, snake_case classes

## Scaffolding: Data Layer (Query/Mutation)

When generating data layer code for a resource:
1. `entities/{name}/schema/{name}.schema.ts` — `z.object({...})` with `z.infer`
2. `entities/{name}/api/{name}.api.ts` — Axios functions using shared client
3. `features/{name}/query/{name}.query.ts` — `queryOptions({ queryKey, queryFn })`
4. `features/{name}/mutation/{name}.mutation.ts` — `useMutation({ mutationFn, onSuccess: invalidate })`
