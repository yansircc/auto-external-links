"use server";

import { generateObject } from "ai";
// import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";
import { keywordSchema } from "./schema";
import { searchGoogle } from "@/lib/serper";
import { type BlacklistEntry, isBlacklisted } from "@/lib/blacklist";
import type { SerperResponse } from "@/lib/serper/schema";

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
      - Provide a brief convincing reason for the reader why they should explore the resource link`,
    prompt: text,
    schema: wrapperSchema,
  });

  // Initialize with null links
  const keywordsWithoutLinks = object.keywords.map((item) => ({
    ...item,
    link: null,
    title: null,
    alternatives: {
      preferred: [],
      regular: [],
    },
  }));

  return { object: keywordsWithoutLinks, finishReason, usage };
}

/**
 * Fetch external links for selected keywords
 */
export async function fetchLinksForKeywords(
  keywords: { keyword: string; query: string }[],
  blacklist: BlacklistEntry[],
  preferredSites: string[],
) {
  // Track used links to prevent duplicates
  const usedLinks = new Set<string>();
  const results = [];

  for (const { keyword, query } of keywords) {
    try {
      // Get search results and filter out blacklisted links
      const searchResults = await searchGoogle(query, preferredSites);
      const validResults = searchResults
        .flat()
        .filter((result) => !isBlacklisted(result.link, blacklist))
        .filter((result) => !usedLinks.has(result.link));

      // No valid results found
      if (validResults.length === 0) {
        results.push({
          keyword,
          link: null,
          title: null,
          alternatives: {
            preferred: [],
            regular: [],
          },
        });
        continue;
      }

      // Separate preferred and regular results
      const preferred = validResults.filter((result) =>
        preferredSites.some((site) => result.link.includes(site)),
      );
      const regular = validResults.filter(
        (result) => !preferredSites.some((site) => result.link.includes(site)),
      );

      // Select best result (prefer preferred sites)
      const bestResult = preferred[0] ?? regular[0];
      if (!bestResult) {
        results.push({
          keyword,
          link: null,
          title: null,
          alternatives: {
            preferred: [],
            regular: [],
          },
        });
        continue;
      }

      usedLinks.add(bestResult.link);

      // Get alternatives (excluding the best result)
      const alternatives = {
        preferred: preferred.filter((r) => r.link !== bestResult.link),
        regular: regular.filter((r) => r.link !== bestResult.link).slice(0, 3),
      };

      results.push({
        keyword,
        link: bestResult.link,
        title: bestResult.title,
        alternatives,
      });
    } catch (error) {
      console.error(`Failed to fetch link for keyword: ${keyword}`, error);
      results.push({
        keyword,
        link: null,
        title: null,
        alternatives: {
          preferred: [],
          regular: [],
        },
      });
    }
  }

  // Convert array to record
  return results.reduce(
    (acc, { keyword, link, title, alternatives }) => ({
      ...acc,
      [keyword]: { link, title, alternatives },
    }),
    {} as Record<
      string,
      {
        link: string | null;
        title: string | null;
        alternatives: {
          preferred: SerperResponse["organic"];
          regular: SerperResponse["organic"];
        };
      }
    >,
  );
}
