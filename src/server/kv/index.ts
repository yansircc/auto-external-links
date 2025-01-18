import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error("Missing UPSTASH_REDIS_* environment variables");
}

/**
 * Redis 客户端单例类
 * 使用 HTTP/REST 方式连接，适用于 Edge Runtime
 *
 * @see https://github.com/upstash/redis-js
 */
class RedisClient {
  private static instance: Redis;

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        url: process.env.UPSTASH_REDIS_URL!,
        token: process.env.UPSTASH_REDIS_TOKEN!,
        // 添加可选的错误重试配置
        retry: {
          retries: 3,
          backoff: (retryCount) => Math.exp(retryCount) * 50,
        },
        // 禁用遥测数据收集（可选）
        automaticDeserialization: true,
      });
    }
    return RedisClient.instance;
  }
}

// 导出单例实例
export const redis = RedisClient.getInstance();

// 导出类型（方便使用）
export type { Redis } from "@upstash/redis";
