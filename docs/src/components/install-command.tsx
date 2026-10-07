"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { packageName } from "@/lib/shared";

const command = `npm i ${packageName}`;

export function InstallCommand({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <div
      className={cn(
        "flex h-11 items-center gap-3 rounded-full border bg-fd-card pr-1.5 pl-5 font-mono text-[13px]",
        className,
      )}
    >
      <span className="truncate">
        <span aria-hidden className="text-fd-muted-foreground select-none">
          ${" "}
        </span>
        {command}
      </span>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy install command"}
        onClick={async () => {
          await navigator.clipboard.writeText(command);
          setCopied(true);
        }}
        className="relative grid size-8 shrink-0 place-items-center rounded-full text-fd-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-fd-accent hover:text-fd-accent-foreground active:scale-[0.97]"
      >
        <Copy
          aria-hidden
          className={cn(
            "absolute size-3.5 transition-[opacity,filter,transform] duration-200",
            copied && "scale-75 opacity-0 blur-[2px]",
          )}
        />
        <Check
          aria-hidden
          className={cn(
            "absolute size-3.5 transition-[opacity,filter,transform] duration-200",
            !copied && "scale-75 opacity-0 blur-[2px]",
          )}
        />
      </button>
    </div>
  );
}
