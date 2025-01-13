/**
 * 关键词工具的类型定义
 * @path src/ai/tools/keywords/schema.ts
 */

import { z } from "zod";

// 表单模式
export const formSchema = z.object({
  text: z
    .string()
    .min(1, "请输入要分析的文本")
    .max(2000, "文本长度不能超过 2000 个字符")
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
}

// 单个关键词的完整信息
export const keywordSchema = z.object({
  keyword: z
    .string()
    .min(1)
    .describe(
      "Keyword from the original text, should be exactly the same, including case and format.",
    ),
  query: z
    .string()
    .min(1)
    .describe(
      "Used to search for the best external link on Google, should be a question.",
    ),
  reason: z
    .string()
    .max(150)
    .describe(
      "Explain why the reader should click this link, tell the recommendation reason.",
    ),
  link: z.string().url().nullable(),
  title: z.string().nullable(),
});

export type KeywordInfo = z.infer<typeof keywordSchema>;

// 关键词分析结果
export interface KeywordAnalysis {
  keywords: KeywordInfo[];
  matches: KeywordMatch[];
}

// 关键词列表模式
export const keywordsSchema = z.array(keywordSchema);
