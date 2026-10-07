import { createGetUrl } from "fumadocs-core/source";

export const appName = "React Highlight Popover";
export const packageName = "@omsimos/react-highlight-popover";
export const siteUrl = "https://react-highlight-popover.omsimos.com";
export const docsRoute = "/docs";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const gitConfig = {
  user: "omsimos",
  repo: "react-highlight-popover",
  branch: "main",
};

export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
export const npmUrl = `https://www.npmjs.com/package/${packageName}`;

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, "content.md"];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, "image.png"];

  return { segments, url: getImageUrl(segments, page.locale) };
}
