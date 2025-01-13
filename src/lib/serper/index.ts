/**
 * Google 搜索工具 (使用 Serper API)
 * @path src/ai/tools/search/serper.ts
 */

import type { SerperResponse } from "./schema";

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = "https://google.serper.dev/search";

interface SearchResult {
  link: string;
  title: string;
  position: number;
  snippet?: string;
  sitelinks?: Array<{
    link: string;
    title: string;
  }>;
}

interface SearchResponse {
  organic: SearchResult[];
  knowledgeGraph?: {
    title: string;
    type?: string;
    description?: string;
    imageUrl?: string;
    website?: string;
    attributes?: Record<string, string>;
  };
  peopleAlsoAsk?: Array<{
    question: string;
    answer: string;
    title: string;
    link: string;
  }>;
}

/**
 * 调用 Serper API 执行 Google 搜索
 * @param query - 搜索查询语句
 * @returns 搜索结果
 * @throws Error 当 API 调用失败时
 */
export async function searchGoogle(query: string): Promise<SearchResult[]> {
  if (!SERPER_API_KEY) {
    throw new Error("Missing SERPER_API_KEY");
  }

  const response = await fetch(SERPER_API_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl: "us",
      hl: "en",
      num: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const data = (await response.json()) as SearchResponse;
  return data.organic;
}

/**
 * 从搜索结果中提取最佳链接
 * @param response - Serper API 响应数据
 * @returns 最佳链接及其标题
 * @throws Error 当提取链接失败时
 */
export function extractBestLink(
  response: SerperResponse,
): { title: string; link: string } | null {
  try {
    // 1. 首先尝试从知识图谱中获取
    if (response.knowledgeGraph?.website) {
      return {
        title: response.knowledgeGraph.title,
        link: response.knowledgeGraph.website,
      };
    }

    // 2. 从有效的搜索结果中选择第一个
    const firstResult = response.organic[0];
    if (firstResult) {
      return {
        title: firstResult.title,
        link: firstResult.link,
      };
    }

    return null;
  } catch (error) {
    console.error("提取链接失败:", error);
    return null;
  }
}
