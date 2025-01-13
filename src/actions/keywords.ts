"use server";

import { generateObject } from "ai";
// import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";
import { keywordSchema } from "./schema";
import { searchGoogle } from "@/lib/serper";
import { type BlacklistEntry, filterBlacklistedLinks } from "@/lib/blacklist";

// 包装成对象类型的模式
const wrapperSchema = z.object({
  keywords: z
    .array(keywordSchema)
    .min(1)
    .max(3)
    .describe(
      "The most important keywords information extracted from the original text, including keywords, search queries, and recommendations.",
    ),
});

/**
 * 分析文本获取关键词
 */
export async function getKeywords(text: string) {
  const { object, finishReason, usage } = await generateObject({
    // model: openai("gpt-4o"),
    model: deepseek("deepseek-chat"),
    system: `
    You are a SEO expert, you need to:
    1. Select 1~3 most valuable keywords/phrases from the text(never select from the heading or title)
    2. For each keyword:
      - Extract the exact keyword or phrase from the text (maintain original case and format). Each should be unique, never repeat.
      - Generate a search query in question form to find the best external link
      - Provide a brief reason for the reader why this keyword or phrase is valuable`,
    prompt: text,
    schema: wrapperSchema,
  });

  // 初始化时设置链接为 null
  const keywordsWithoutLinks = object.keywords.map((item) => ({
    ...item,
    link: null,
    title: null,
  }));

  return { object: keywordsWithoutLinks, finishReason, usage };
}

/**
 * 为选中的关键词获取外部链接
 */
export async function fetchLinksForKeywords(
  keywords: { keyword: string; query: string }[],
  blacklist: BlacklistEntry[],
) {
  const results = await Promise.all(
    keywords.map(async ({ keyword, query }) => {
      try {
        const searchResults = await searchGoogle(query);
        const filteredResults = filterBlacklistedLinks(
          searchResults,
          blacklist,
        );
        const bestResult = filteredResults[0];

        return {
          keyword,
          link: bestResult?.link ?? null,
          title: bestResult?.title ?? null,
        };
      } catch (error) {
        console.error(`Failed to fetch link for keyword: ${keyword}`, error);
        return { keyword, link: null, title: null };
      }
    }),
  );

  return results.reduce(
    (acc, { keyword, link, title }) => ({
      ...acc,
      [keyword]: { link, title },
    }),
    {} as Record<string, { link: string | null; title: string | null }>,
  );
}
