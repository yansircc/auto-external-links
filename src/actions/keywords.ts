"use server";

import { generateObject } from "ai";
// import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";
import { keywordSchema } from "./schema";
import { searchGoogle } from "@/lib/serper";
import {
  type BlacklistEntry,
  filterBlacklistedLinks,
  isBlacklisted,
} from "@/lib/blacklist";
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
      - Provide a brief reason for the reader why this keyword or phrase is valuable`,
    prompt: text,
    schema: wrapperSchema,
  });

  // 初始化时设置链接为 null
  const keywordsWithoutLinks = object.keywords.map((item) => ({
    ...item,
    link: null,
    title: null,
    alternatives: {
      preferred: [],
      regular: [],
      blacklisted: [],
    },
  }));

  return { object: keywordsWithoutLinks, finishReason, usage };
}

/**
 * 为选中的关键词获取外部链接
 */
export async function fetchLinksForKeywords(
  keywords: { keyword: string; query: string }[],
  blacklist: BlacklistEntry[],
  preferredSites: string[],
) {
  // Track used links to prevent duplicates
  const usedLinks = new Set<string>();

  // Process keywords sequentially to respect priority
  const results = [];

  for (const { keyword, query } of keywords) {
    try {
      // 获取所有搜索结果
      const allSearchResults = await searchGoogle(query, preferredSites);
      console.log("Search results for keyword:", {
        keyword,
        query,
        resultsCount: allSearchResults.length,
        results: allSearchResults,
      });

      // 将所有搜索结果合并并去重
      const uniqueResults = Array.from(
        new Map(
          allSearchResults.flat().map((result) => [result.link, result]),
        ).values(),
      );
      console.log("Unique results:", {
        keyword,
        count: uniqueResults.length,
        results: uniqueResults,
      });

      // 分离黑名单和正常链接
      const { blacklisted, normal } = uniqueResults.reduce(
        (acc, result) => {
          if (isBlacklisted(result.link, blacklist)) {
            acc.blacklisted.push(result);
          } else {
            acc.normal.push(result);
          }
          return acc;
        },
        { blacklisted: [], normal: [] } as {
          blacklisted: typeof uniqueResults;
          normal: typeof uniqueResults;
        },
      );

      // 按优先级排序：首选网站优先
      const sortedNormal = normal.sort((a, b) => {
        const aIsPreferred = preferredSites.some((site) =>
          a.link.includes(site),
        );
        const bIsPreferred = preferredSites.some((site) =>
          b.link.includes(site),
        );
        if (aIsPreferred && !bIsPreferred) return -1;
        if (!aIsPreferred && bIsPreferred) return 1;
        return 0;
      });

      // 找到第一个未使用的链接作为默认链接
      const bestResult = sortedNormal.find(
        (result) => !usedLinks.has(result.link),
      );

      if (bestResult) {
        usedLinks.add(bestResult.link);
        const alternatives = {
          preferred: sortedNormal
            .filter(
              (result) =>
                result !== bestResult &&
                preferredSites.some((site) => result.link.includes(site)),
            )
            .slice(0, 3),
          regular: sortedNormal
            .filter(
              (result) =>
                result !== bestResult &&
                !preferredSites.some((site) => result.link.includes(site)),
            )
            .slice(0, 7),
          blacklisted: blacklisted.slice(0, 3),
        };
        console.log("Alternatives for keyword:", {
          keyword,
          bestResult,
          alternatives,
        });
        results.push({
          keyword,
          link: bestResult.link,
          title: bestResult.title,
          alternatives,
        });
      } else {
        results.push({
          keyword,
          link: null,
          title: null,
          alternatives: {
            preferred: [],
            regular: [],
            blacklisted: [],
          },
        });
      }
    } catch (error) {
      console.error(`Failed to fetch link for keyword: ${keyword}`, error);
      results.push({
        keyword,
        link: null,
        title: null,
        alternatives: {
          preferred: [],
          regular: [],
          blacklisted: [],
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
          blacklisted: SerperResponse["organic"];
        };
      }
    >,
  );
}
