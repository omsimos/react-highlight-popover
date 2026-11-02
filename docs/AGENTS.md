# Docs site

The documentation site for `@omsimos/react-highlight-popover`, built with Next.js 16 and Fumadocs. It deploys to Vercel on Node 24. See the root `AGENTS.md` for repository-wide commands.

- Pages are MDX files in `content/docs`. `content/docs/meta.json` sets the sidebar order, so add new pages there.
- Components available in MDX are registered in `src/components/mdx.tsx`. Live demos are in `src/components/demos.tsx`, and the interactive playground is in `src/components/playground.tsx`.
- The site imports the library from the workspace package, so it shows whatever is in `lib/dist`. Run `bun run dev` from the root to rebuild the library while you edit.
- `src/proxy.ts` and the `llms.txt`, `llms-full.txt`, and `llms.mdx` routes serve Markdown versions of the docs. Keep them working when you rename or move pages.
- `bun run typecheck` in this workspace runs `next typegen` first.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
