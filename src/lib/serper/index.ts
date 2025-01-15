/**
 * Google 搜索工具 (使用 Serper API)
 * @path src/lib/serper/index.ts
 */

import { validateSerperResponse } from "./schema";
import type { SerperResponse } from "./schema";

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = "https://google.serper.dev/search";

/**
 * 调用 Serper API 执行 Google 搜索
 * @param query - 搜索查询语句
 * @param preferredSites - 可选的偏好网站域名数组 (例如: ['arxiv.org', 'scholar.google.com'])
 * @returns 搜索结果，优先返回偏好网站的结果
 * @throws Error 当 API 调用失败时
 */
export async function searchGoogle(
  query: string,
  preferredSites?: string[],
): Promise<SerperResponse["organic"]> {
  if (!SERPER_API_KEY) {
    throw new Error("Missing SERPER_API_KEY");
  }

  // 如果没有偏好网站，直接执行普通搜索
  if (!preferredSites?.length) {
    return await performSearch(query);
  }

  // 构建所有搜索请求：偏好网站搜索 + 普通搜索
  const searchPromises = [
    // 为每个偏好网站创建一个搜索请求
    ...preferredSites.map((site) => performSearch(`site:${site} ${query}`)),
    // 添加普通搜索作为后备
    performSearch(query),
  ];

  // 并行执行所有搜索请求
  const allResults = await Promise.all(searchPromises);

  // 按优先级返回第一个有结果的搜索
  // allResults[0] 到 allResults[n-2] 是偏好网站的结果
  // allResults[n-1] 是普通搜索结果
  for (const results of allResults) {
    if (results.length > 0) {
      return results;
    }
  }

  // 如果所有搜索都没有结果，返回空数组
  return [];
}

/**
 * 执行实际的搜索请求
 * @param searchQuery - 完整的搜索查询
 * @returns 搜索结果
 */
async function performSearch(
  searchQuery: string,
): Promise<SerperResponse["organic"]> {
  try {
    // 确保 API key 存在
    if (!SERPER_API_KEY) {
      throw new Error("Missing SERPER_API_KEY");
    }

    const headers: HeadersInit = {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    };

    const response = await fetch(SERPER_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        q: searchQuery,
        gl: "us",
        hl: "en",
        num: 3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = validateSerperResponse(await response.json());
    return data.organic;
  } catch (error) {
    console.error(`搜索失败 (${searchQuery}):`, error);
    return []; // 返回空数组而不是抛出错误，让其他搜索有机会成功
  }
}
