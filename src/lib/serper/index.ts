import { env } from "@/env";
import { catchError } from "@/utils";
import type { SerperResponse } from "./schema";
import { validateSerperResponse } from "./schema";

const SERPER_API_KEY = env.SERPER_API_KEY;
const SERPER_API_URL = "https://google.serper.dev/search";

/**
 * 调用 Serper API 执行 Google 搜索
 * @param query - 搜索查询语句
 * @param preferredSites - 可选的偏好网站域名数组
 * @returns 搜索结果，优先返回偏好网站的结果
 */
export async function searchGoogle(
	query: string,
	preferredSites?: string[],
): Promise<SerperResponse["organic"][]> {
	if (!SERPER_API_KEY) {
		throw new Error("Missing SERPER_API_KEY");
	}

	// 如果没有偏好网站，直接执行普通搜索
	if (!preferredSites?.length) {
		const [error, results] = await catchError(performSearch(query));
		if (error) {
			console.error("普通搜索失败:", error);
			return [];
		}
		return [results];
	}

	// 构建所有搜索请求：偏好网站搜索 + 普通搜索
	const searchPromises = [
		// 为每个偏好网站创建一个搜索请求
		...preferredSites.map((site) => performSearch(`site:${site} ${query}`)),
		// 添加普通搜索作为后备
		performSearch(query),
	];

	// 并行执行所有搜索请求，并处理错误
	const results = await Promise.all(
		searchPromises.map(async (promise) => {
			const [error, results] = await catchError(promise);
			if (error) {
				console.error("搜索失败:", error);
				return [];
			}
			return results;
		}),
	);

	// 返回所有有结果的搜索
	return results.filter((results) => results.length > 0);
}

/**
 * 执行实际的搜索请求
 * @param searchQuery - 完整的搜索查询
 * @returns 搜索结果
 */
async function performSearch(
	searchQuery: string,
): Promise<SerperResponse["organic"]> {
	// 确保 API key 存在
	if (!SERPER_API_KEY) {
		throw new Error("Missing SERPER_API_KEY");
	}

	const headers: HeadersInit = {
		"X-API-KEY": SERPER_API_KEY,
		"Content-Type": "application/json",
	};

	// 发送请求
	const [fetchError, response] = await catchError(
		fetch(SERPER_API_URL, {
			method: "POST",
			headers,
			body: JSON.stringify({
				q: searchQuery,
				gl: "us",
				hl: "en",
				num: 10,
			}),
		}),
	);

	if (fetchError) {
		console.error(`API 请求失败 (${searchQuery}):`, fetchError);
		return [];
	}

	if (!response.ok) {
		console.error(`搜索失败: ${response.statusText}`);
		return [];
	}

	// 解析响应
	const [jsonError, json] = await catchError(response.json());
	if (jsonError) {
		console.error(`解析响应失败 (${searchQuery}):`, jsonError);
		return [];
	}

	// 验证响应数据
	const [validateError, data] = catchError(() => validateSerperResponse(json));

	if (validateError) {
		console.error(`验证响应失败 (${searchQuery}):`, validateError);
		return [];
	}

	return data.organic;
}
