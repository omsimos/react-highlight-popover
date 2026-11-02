# react-highlight-popover

A headless React component that shows a popover when the user selects text inside it. It has no runtime dependencies. The npm package is `@omsimos/react-highlight-popover`.

## Layout

This is a Bun workspace monorepo run with Turborepo.

- `lib/`: the published package. All of the code is in `lib/src/HighlightPopover.tsx`, and `lib/src/index.ts` re-exports it. tsdown builds it to `lib/dist/index.mjs` with a `"use client"` banner.
- `tests/`: the test suite (`bun test` with happy-dom and Testing Library). It imports the built package from `@omsimos/react-highlight-popover`, not from `lib/src`.
- `docs/`: the documentation site (Next.js 16 and Fumadocs). It has its own `docs/AGENTS.md`.
- `.changeset/`: pending changesets for the next release.

## Commands

Run these from the repository root.

```sh
bun install         # also points git at .githooks
bun run build       # build lib and docs
bun run typecheck   # typecheck every workspace
bun run test        # build lib, then run bun test
bun fmt             # format every file (Bun's built-in, Prettier-compatible formatter)
bun fmt --check     # check formatting without writing, as CI does
bun run dev         # lib in watch mode plus the docs site on localhost:3000
```

Plain `bun test` runs against whatever is in `lib/dist`. After editing `lib/src`, use `bun run test` so the tests see your change.

The `prepare` script sets `core.hooksPath` to `.githooks`, whose pre-commit hook runs `bun fmt --staged` to format staged files and restage them. If a file has both staged and unstaged changes and needs formatting, the hook fails and names it. Format it with `bun fmt` and stage it again.

CI also checks formatting with `bun fmt --check`, lints the package with `bunx publint`, and runs the tests against React 18. The package supports React 18 and 19, so don't use APIs that only exist in React 19.

## Library rules

- Keep the package free of runtime dependencies. `react` and `react-dom` are peer dependencies.
- `lib/tsconfig.json` enables `isolatedDeclarations`, so exported functions and values need explicit return types.
- The component must render on the server. Guard `window` and `document` access, and use the existing `useIsomorphicLayoutEffect` instead of `useLayoutEffect` directly.
- Every public prop and type has a JSDoc comment. Keep them current, since they ship in the `.d.mts` file.
- When a bug fix lands, add a test under the `regressions` block in `tests/HighlightPopover.test.tsx`.
- If you change the public API, update `README.md`, `lib/README.md`, and the pages in `docs/content/docs`.

## Releases

Releases go through Changesets. Any change to `lib/` that users will notice needs a changeset:

```sh
bunx changeset
```

Pick `patch`, `minor`, or `major` for `@omsimos/react-highlight-popover` and write a one-line summary. On push to `main`, the release workflow opens a "chore: version packages" PR. Merging that PR publishes to npm through trusted publishing. Don't edit `lib/CHANGELOG.md` or the package version by hand.

## Commits

Use Conventional Commits, for example `fix: show the popover for triple-click selections` or `feat(docs): add an examples page`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
