/**
 * 服务基础接口
 */
export interface IService {
	readonly serviceName: string;
}

/**
 * 可缓存的服务
 */
export interface ICacheable {
	clearCache(): void;
}

/**
 * 健康检查接口
 */
export interface IHealthCheckable {
	healthCheck(): Promise<HealthCheckResult>;
}

/**
 * 健康检查结果
 */
export interface HealthCheckResult {
	healthy: boolean;
	services?: Record<string, boolean>;
	details?: Record<string, unknown>;
}
