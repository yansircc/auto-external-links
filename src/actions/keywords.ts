"use server";

import { generateObject } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";
import { keywordSchema } from "./schema";
import { searchGoogle } from "@/lib/serper";
import { type BlacklistEntry, isBlacklisted } from "@/lib/blacklist";
import type { SerperResponse } from "@/lib/serper/schema";
import { catchError } from "@/utils";
import { auth } from "@/server/auth";
import { isRateLimited } from "@/lib/rate-limit";

interface KeywordsResponse {
  error?: {
    code: "RATE_LIMITED" | "AI_ERROR";
    message: string;
  };
  data?: {
    object: {
      keywords: Array<{
        keyword: string;
        query: string;
        reason: string;
        link: null;
        title: null;
        alternatives: {
          preferred: SerperResponse["organic"];
          regular: SerperResponse["organic"];
        };
      }>;
    };
    finishReason: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

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
export async function getKeywords(
  text: string,
  fingerprint?: string,
): Promise<KeywordsResponse> {
  // 1. 检查用户是否已登录
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // 2. 如果未登录，检查是否超出访问限制
  if (!isAuthenticated) {
    const limited = await isRateLimited(fingerprint);
    if (limited) {
      return {
        error: {
          code: "RATE_LIMITED",
          message: "未注册用户每日使用次数有限，请登录后继续使用",
        },
      };
    }
  }

  // 3. 继续原有的关键词分析逻辑
  const [error, result] = await catchError(
    generateObject({
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
    }),
    (error) => new Error("分析文本失败", { cause: error }),
  );

  if (error) {
    return {
      error: {
        code: "AI_ERROR",
        message: "分析文本失败，请稍后重试",
      },
    };
  }

  return {
    data: {
      object: {
        keywords: result.object.keywords.map((item) => ({
          ...item,
          link: null,
          title: null,
          alternatives: {
            preferred: [],
            regular: [],
          },
        })),
      },
      finishReason: result.finishReason,
      usage: {
        prompt_tokens: result.usage.promptTokens,
        completion_tokens: result.usage.completionTokens,
        total_tokens: result.usage.totalTokens,
      },
    },
  };
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
    const [error, searchResults] = await catchError(
      searchGoogle(query, preferredSites),
    );

    if (error) {
      console.error(`获取关键词 "${keyword}" 的链接失败:`, error);
      results.push({
        keyword,
        link: null,
        title: null,
        alternatives: { preferred: [], regular: [] },
      });
      continue;
    }

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
