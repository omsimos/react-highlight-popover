import Link from "next/link";
import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";
import {
  Accessibility,
  ArrowRight,
  Blocks,
  Feather,
  MousePointerClick,
  Move,
  Server,
  TextCursor,
} from "lucide-react";
import {
  HighlightsChip,
  SelectionToolbar,
} from "@/components/selection-toolbar";
import { InstallCommand } from "@/components/install-command";
import { Playground } from "@/components/playground";
import { githubUrl, npmUrl } from "@/lib/shared";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: Blocks,
    title: "Headless",
    body: "Render any React element. The component adds no styles of its own.",
  },
  {
    icon: Feather,
    title: "Small",
    body: "About 2.4 kB gzipped, with no dependencies besides React.",
  },
  {
    icon: Move,
    title: "Collision handling",
    body: "The popover flips and shifts to stay on screen, and follows the text on scroll and resize.",
  },
  {
    icon: MousePointerClick,
    title: "Waits for release",
    body: "The popover appears after the user releases the mouse, not halfway through a drag.",
  },
  {
    icon: Accessibility,
    title: "Keyboard and ARIA",
    body: "Escape hides the popover, keyboard selections show it, and popoverProps sets its ARIA attributes.",
  },
  {
    icon: Server,
    title: "Server Components",
    body: 'The build includes a "use client" directive, so you can render it from a Server Component.',
  },
];

const quickStart = `import { HighlightPopover } from "@omsimos/react-highlight-popover";

export function Article({ children }) {
  return (
    <HighlightPopover
      offset={{ y: 8 }}
      renderPopover={({ selection }) => (
        <div className="rounded-lg border bg-white p-2 shadow-lg">
          You selected: {selection}
        </div>
      )}
    >
      {children}
    </HighlightPopover>
  );
}`;

const buttonBase =
  "inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[0.97]";

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-4xl tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {children && (
        <p className="mt-4 text-fd-muted-foreground text-pretty">{children}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="px-4 pt-20 pb-24 sm:pt-28">
        <SelectionToolbar className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Link
            href="/docs/migration"
            className="group inline-flex items-center gap-2 rounded-full border bg-fd-card py-1 pr-3 pl-1.5 text-xs text-fd-muted-foreground transition-colors duration-150 hover:text-fd-foreground"
          >
            <span className="rounded-full bg-marker px-2 py-0.5 font-medium text-marker-ink">
              v2
            </span>
            Placement, collision handling, and portals
            <ArrowRight
              aria-hidden
              className="size-3 transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </Link>

          <h1 className="mt-8 font-serif text-[clamp(3.25rem,10vw,6.5rem)] leading-[0.95] tracking-tight text-balance">
            Popovers for{" "}
            <span className="marker-swipe -mx-1 px-1 italic">highlighted</span>{" "}
            text
          </h1>

          <p className="mt-6 max-w-xl text-lg text-fd-muted-foreground text-pretty">
            A headless React component that shows a popover when people select
            text. You write the popover. The component decides when to show it,
            where to place it, and when to hide it.
          </p>

          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/docs"
              className={cn(
                buttonBase,
                "bg-fd-primary text-fd-primary-foreground hover:opacity-90",
              )}
            >
              Get started
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <InstallCommand className="max-w-full" />
          </div>

          <p className="mt-12 flex items-center gap-2 text-sm text-fd-muted-foreground">
            <TextCursor aria-hidden className="size-4" />
            Select any text on this page to try it
          </p>
        </SelectionToolbar>
      </section>

      <section className="border-t px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Playground" title="Try the options">
            Select text in the box, then change the options. The code below
            updates to match.
          </SectionHeading>
          <Playground />
        </div>
      </section>

      <section className="border-t px-4 py-24">
        <SelectionToolbar className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Features" title="What it handles for you" />
          <ul className="grid gap-px overflow-hidden rounded-2xl border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-fd-background p-7">
                <Icon
                  aria-hidden
                  className="size-5 text-fd-muted-foreground"
                  strokeWidth={1.75}
                />
                <h3 className="mt-5 font-medium">{title}</h3>
                <p className="mt-1.5 text-sm text-fd-muted-foreground text-pretty">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </SelectionToolbar>
      </section>

      <section className="border-t px-4 py-24">
        <SelectionToolbar className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="font-mono text-xs tracking-widest text-fd-muted-foreground uppercase">
              Quick start
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Wrap the text people can select
            </h2>
            <p className="mt-4 text-fd-muted-foreground text-pretty">
              Pass a <code className="font-mono text-sm">renderPopover</code>{" "}
              function that returns your popover. Inside the popover, the{" "}
              <code className="font-mono text-sm">useHighlightPopover</code>{" "}
              hook reads the selection and can close the popover.
            </p>
            <Link
              href="/docs"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Read the docs
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
          <div className="min-w-0 [&_figure]:my-0 [&_figure]:shadow-sm">
            <ServerCodeBlock lang="tsx" code={quickStart} />
          </div>
        </SelectionToolbar>
      </section>

      <section className="border-t px-4 py-28">
        <SelectionToolbar className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="font-serif text-5xl tracking-tight text-balance sm:text-6xl">
            Add a <span className="italic">selection popover</span> to your app
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className={cn(
                buttonBase,
                "bg-fd-primary text-fd-primary-foreground hover:opacity-90",
              )}
            >
              Read the docs
            </Link>
            <a
              href={githubUrl}
              className={cn(
                buttonBase,
                "border bg-fd-card hover:bg-fd-accent hover:text-fd-accent-foreground",
              )}
            >
              Star on GitHub
            </a>
          </div>
        </SelectionToolbar>
      </section>

      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-fd-muted-foreground sm:flex-row">
          <p>
            MIT License. Built by{" "}
            <a
              href="https://github.com/omsimos"
              className="text-fd-foreground underline-offset-4 hover:underline"
            >
              omsimos
            </a>
            .
          </p>
          <div className="flex gap-5">
            <a href={npmUrl} className="hover:text-fd-foreground">
              npm
            </a>
            <a href={githubUrl} className="hover:text-fd-foreground">
              GitHub
            </a>
            <Link href="/docs" className="hover:text-fd-foreground">
              Docs
            </Link>
          </div>
        </div>
      </footer>

      <HighlightsChip />
    </main>
  );
}
