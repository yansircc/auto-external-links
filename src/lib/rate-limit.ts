import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { headers } from "next/headers";
import { redis } from "@/server/kv";

const RATE_LIMIT_PREFIX = "rate-limit:";
const DAILY_LIMIT = 3;

interface RateLimitInfo {
	remaining: number;
	reset: number;
	total: number;
}

/**
 * 获取访问者的唯一标识
 * 结合 IP + 指纹 + Cookie 来尽可能准确地识别用户
 */
async function getVisitorId(fingerprint?: string): Promise<string> {
	const headersList: ReadonlyHeaders = await headers();
	const ip =
		headersList.get("x-real-ip") ??
		headersList.get("x-forwarded-for") ??
		"127.0.0.1";

	// 如果有指纹，就结合 IP 和指纹
	if (fingerprint) {
		return `${ip}:${fingerprint}`;
	}

	return ip;
}

/**
 * 获取今天的开始时间戳（UTC）
 */
function getTodayStart(): number {
	const now = new Date();
	const start = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
	);
	return start;
}

/**
 * 获取到第二天开始的秒数
 */
function getSecondsUntilNextDay(): number {
	const now = new Date();
	const tomorrow = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
	);
	return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
}

/**
 * 获取当前访问次数
 */
async function getCurrentCount(fingerprint?: string): Promise<number> {
	const visitorId = await getVisitorId(fingerprint);
	const key = `${RATE_LIMIT_PREFIX}${visitorId}:${getTodayStart()}`;
	const count = await redis.get<string>(key);
	return count ? Number.parseInt(count, 10) : 0;
}

/**
 * 增加访问次数
 */
async function incrementCount(fingerprint?: string): Promise<number> {
	const visitorId = await getVisitorId(fingerprint);
	const key = `${RATE_LIMIT_PREFIX}${visitorId}:${getTodayStart()}`;

	// 使用 Redis 的 INCR 命令原子性地增加计数
	const count = await redis.incr(key);

	// 如果是第一次访问，设置过期时间
	if (count === 1) {
		await redis.expire(key, getSecondsUntilNextDay());
	}

	return count;
}

/**
 * 检查并更新访问次数
 * @param fingerprint - 浏览器指纹
 * @param increment - 是否增加计数
 * @returns 返回剩余次数信息
 */
export async function checkRateLimit(
	fingerprint?: string,
	increment = false,
): Promise<RateLimitInfo> {
	// 开发环境下跳过限流
	if (process.env.NODE_ENV === "development") {
		return {
			remaining: 999,
			reset: getTodayStart() + 24 * 60 * 60 * 1000,
			total: 999,
		};
	}

	const count = increment
		? await incrementCount(fingerprint)
		: await getCurrentCount(fingerprint);

	return {
		remaining: Math.max(0, DAILY_LIMIT - count),
		reset: getTodayStart() + 24 * 60 * 60 * 1000, // 第二天 0 点
		total: DAILY_LIMIT,
	};
}

/**
 * 检查用户是否已超出限制
 * @param fingerprint - 浏览器指纹
 * @returns 是否已超出限制
 */
export async function isRateLimited(fingerprint?: string): Promise<boolean> {
	const { remaining } = await checkRateLimit(fingerprint, false);
	return remaining <= 0;
}
