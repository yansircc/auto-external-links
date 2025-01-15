/**
 * 关键词工具的类型定义
 * @path src/ai/tools/keywords/schema.ts
 */

import { z } from "zod";

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
    .describe(
      "Convince the reader to explore this link behind the keyword or phrase, around 150 characters.",
    ),
  link: z.string().url().nullable(),
  title: z.string().nullable(),
});

export type KeywordInfo = z.infer<typeof keywordSchema>;

// 关键词列表模式
export const keywordsSchema = z
  .array(keywordSchema)
  .min(1)
  .max(3)
  .describe(
    "The most important keywords or phrases information extracted from the original text, including keywords, search queries, and recommendations for clicking.",
  );
