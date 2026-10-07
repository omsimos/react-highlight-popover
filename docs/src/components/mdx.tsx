import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import type { MDXComponents } from "mdx/types";
import {
  ArrowDemo,
  BasicDemo,
  PortalDemo,
  ReleaseDemo,
  ToolbarDemo,
} from "./demos";
import { Playground } from "./playground";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    ArrowDemo,
    BasicDemo,
    Playground,
    PortalDemo,
    ReleaseDemo,
    ToolbarDemo,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
