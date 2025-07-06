/**
 * 关键词工具的类型定义
 * @path src/ai/tools/keywords/schema.ts
 */

import { z } from "zod";
import type { SerperResponse } from "@/lib/serper/schema";
import { MAX_LENGTH } from "./config";

// 表单模式
export const formSchema = z.object({
	text: z
		.string()
		.min(1, "请输入要分析的文本")
		.max(MAX_LENGTH, `文本长度不能超过 ${MAX_LENGTH} 个字符`)
		.refine((text) => !/[\u4e00-\u9fa5]/.test(text), {
			message: "暂不支持中文文本分析",
		}),
});

export type FormData = z.infer<typeof formSchema>;

// 关键词匹配
export interface KeywordMatch {
	keyword: string;
	index: number;
}

// 关键词元数据
export interface KeywordMetadata {
	query: string;
	reason: string;
	link: string | null;
	title: string | null;
	alternatives: {
		preferred: SerperResponse["organic"];
		regular: SerperResponse["organic"];
	};
}
