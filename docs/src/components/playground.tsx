"use client";

import {
  HighlightPopover,
  type PopoverAlignment,
  type PopoverPlacement,
} from "@omsimos/react-highlight-popover";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Options {
  placement: PopoverPlacement;
  alignment: PopoverAlignment;
  offset: number;
  showWhileSelecting: boolean;
  avoidCollisions: boolean;
  closeOnEscape: boolean;
}

const defaults: Options = {
  placement: "bottom",
  alignment: "center",
  offset: 8,
  showWhileSelecting: false,
  avoidCollisions: true,
  closeOnEscape: true,
};

function toCode(options: Options) {
  const props: string[] = [];
  if (options.placement !== "bottom")
    props.push(`placement="${options.placement}"`);
  if (options.alignment !== "center")
    props.push(`alignment="${options.alignment}"`);
  if (options.offset !== 0) props.push(`offset={{ y: ${options.offset} }}`);
  if (options.showWhileSelecting) props.push("showWhileSelecting");
  if (!options.avoidCollisions) props.push("avoidCollisions={false}");
  if (!options.closeOnEscape) props.push("closeOnEscape={false}");

  const attributes = ["renderPopover={renderPopover}", ...props]
    .map((prop) => `      ${prop}`)
    .join("\n");

  return `import { HighlightPopover } from "@omsimos/react-highlight-popover";

const renderPopover = ({ selection }) => (
  <div className="rounded-lg border bg-white p-3 shadow-lg">
    {selection}
  </div>
);

export function Article() {
  return (
    <HighlightPopover
${attributes}
    >
      <p>Select some text in this paragraph.</p>
    </HighlightPopover>
  );
}`;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  const name = useId();

  return (
    <fieldset className="flex items-center justify-between gap-4">
      <legend className="float-left text-sm text-fd-muted-foreground">
        {label}
      </legend>
      <div className="flex rounded-lg bg-fd-muted p-0.5">
        {options.map((option) => (
          <label
            key={option}
            className={cn(
              "relative cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium capitalize text-fd-muted-foreground transition-[background-color,color,box-shadow] duration-150",
              "has-focus-visible:outline-2 has-focus-visible:outline-marker",
              value === option &&
                "bg-fd-background text-fd-foreground shadow-sm",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Switch({
  label,
  checked,
  onChange,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-sm text-fd-muted-foreground">
      {label}
      <span className="relative inline-flex">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "h-5 w-9 rounded-full bg-fd-muted-foreground/25 transition-colors duration-150",
            "peer-checked:bg-fd-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marker",
          )}
        />
        <span
          aria-hidden
          className="absolute top-0.5 left-0.5 size-4 rounded-full bg-fd-background shadow-sm transition-transform duration-200 ease-out-strong peer-checked:translate-x-4"
        />
      </span>
    </label>
  );
}

export function Playground() {
  const [options, setOptions] = useState(defaults);
  const set = <K extends keyof Options>(key: K) => {
    return (value: Options[K]) =>
      setOptions((prev) => ({ ...prev, [key]: value }));
  };
  const offsetId = useId();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl border bg-fd-card lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-h-80 flex-col justify-center border-b p-8 sm:p-12 lg:border-r lg:border-b-0">
        <HighlightPopover
          placement={options.placement}
          alignment={options.alignment}
          offset={{ y: options.offset }}
          showWhileSelecting={options.showWhileSelecting}
          avoidCollisions={options.avoidCollisions}
          closeOnEscape={options.closeOnEscape}
          renderPopover={({ selection, placement }) => (
            <div className="popover-enter max-w-64 rounded-xl border bg-fd-popover p-3 text-fd-popover-foreground shadow-lg">
              <p className="font-mono text-[11px] tracking-wide text-fd-muted-foreground uppercase">
                {placement} · {selection.length} chars
              </p>
              <p className="mt-1 line-clamp-2 text-sm">“{selection}”</p>
            </div>
          )}
        >
          <p className="font-serif text-2xl leading-snug text-pretty sm:text-3xl">
            Typography is what language looks like. Select a few words here,
            then change the options to see how the popover responds.
          </p>
        </HighlightPopover>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <Segmented
          label="Placement"
          value={options.placement}
          options={["bottom", "top"] as const}
          onChange={set("placement")}
        />
        <Segmented
          label="Alignment"
          value={options.alignment}
          options={["left", "center", "right"] as const}
          onChange={set("alignment")}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-fd-muted-foreground">
            <label htmlFor={offsetId}>Offset</label>
            <span className="font-mono text-xs tabular-nums">
              {options.offset}px
            </span>
          </div>
          <input
            id={offsetId}
            type="range"
            min={0}
            max={32}
            value={options.offset}
            onChange={(event) => set("offset")(Number(event.target.value))}
            className="accent-fd-primary"
          />
        </div>
        <Switch
          label="Show while selecting"
          checked={options.showWhileSelecting}
          onChange={set("showWhileSelecting")}
        />
        <Switch
          label="Avoid collisions"
          checked={options.avoidCollisions}
          onChange={set("avoidCollisions")}
        />
        <Switch
          label="Close on Escape"
          checked={options.closeOnEscape}
          onChange={set("closeOnEscape")}
        />
      </div>

      <div className="min-w-0 border-t lg:col-span-2 [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0">
        <DynamicCodeBlock lang="tsx" code={toCode(options)} />
      </div>
    </div>
  );
}
