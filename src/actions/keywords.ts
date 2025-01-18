"use server";

import { generateObject } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";
import { keywordSchema } from "./schema";
import { searchGoogle } from "@/lib/serper";
import type { SerperResponse } from "@/lib/serper/schema";
import { catchError } from "@/utils";
import { auth } from "@/server/auth";
import { checkRateLimit } from "@/lib/rate-limit";

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
    const { remaining } = await checkRateLimit(fingerprint, false);
    if (remaining <= 0) {
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

  // 4. 如果分析成功且用户未登录，增加使用次数
  if (!error && !isAuthenticated) {
    await checkRateLimit(fingerprint, true);
  }

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

interface KeywordSearchResult {
  keyword: string;
  query: string;
}

interface LinkResult {
  link: string;
  title: string;
  alternatives: {
    preferred: SerperResponse["organic"];
    regular: SerperResponse["organic"];
  };
}

/**
 * 为关键词获取外部链接
 * @param keywords 关键词列表
 * @param blacklist 黑名单域名列表
 * @param preferredSites 偏好站点列表
 * @returns 关键词到链接的映射
 */
export async function fetchLinksForKeywords(
  keywords: KeywordSearchResult[],
  blacklist: string[],
  preferredSites: string[],
): Promise<Record<string, LinkResult>> {
  const linkMap: Record<string, LinkResult> = {};

  // 并行搜索所有关键词
  await Promise.all(
    keywords.map(async ({ keyword, query }) => {
      const [error, results] = await catchError(
        searchGoogle(query, preferredSites),
      );
      if (error || !results?.length) return;

      // 合并所有搜索结果
      const allResults = results.flat();

      // 过滤搜索结果
      const filteredResults = allResults.filter((item) => {
        try {
          const domain = new URL(item.link).hostname.replace(/^www\./, "");
          return !blacklist.includes(domain);
        } catch {
          return false;
        }
      });

      // 分离偏好站点和普通站点
      const [preferred, regular] = filteredResults.reduce<
        [SerperResponse["organic"], SerperResponse["organic"]]
      >(
        (acc, item) => {
          try {
            const domain = new URL(item.link).hostname.replace(/^www\./, "");
            if (preferredSites.includes(domain)) {
              return [[...acc[0], item], acc[1]];
            }
            return [acc[0], [...acc[1], item]];
          } catch {
            return acc;
          }
        },
        [[], []],
      );

      // 选择最佳链接
      const bestLink = preferred[0] ?? regular[0];
      if (bestLink) {
        linkMap[keyword] = {
          link: bestLink.link,
          title: bestLink.title,
          alternatives: {
            preferred,
            regular,
          },
        };
      }
    }),
  );

  return linkMap;
}
