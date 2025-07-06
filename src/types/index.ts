// 导出所有类型定义
export * from "./keywords";
export * from "./search";

// 通用类型
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		details?: unknown;
	};
}

// 分页相关
export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}
