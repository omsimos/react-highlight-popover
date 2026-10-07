# Docs

The documentation site for `@omsimos/react-highlight-popover`, built with [Next.js](https://nextjs.org) and [Fumadocs](https://fumadocs.dev).

## Development

From the repository root:

```sh
bun install
bun run dev
```

This builds the library in watch mode and starts the site at [localhost:3000](http://localhost:3000).

## Structure

- `content/docs`: documentation pages, written in MDX. Page order is set in `meta.json`.
- `src/app/(home)`: the landing page.
- `src/components`: the playground, live demos, and the selection toolbar used across the site.
