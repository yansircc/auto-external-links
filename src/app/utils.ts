/**
 * 关键词工具实用函数
 * @path src/ai/tools/keywords/utils.ts
 */

import { type KeywordMatch } from "./schema";

/**
 * 在文本中查找关键词的位置
 * @param text - 原始文本
 * @param keywords - 要查找的关键词列表
 * @returns 关键词匹配信息数组
 */
export function findKeywordsInText(
  text: string,
  keywords: string[],
): KeywordMatch[] {
  const matches: KeywordMatch[] = [];

  // 对每个关键词进行查找
  keywords.forEach((keyword) => {
    let index = 0;
    while (true) {
      // 从当前位置开始查找关键词
      index = text.indexOf(keyword, index);
      if (index === -1) break;

      // 添加匹配信息
      matches.push({
        keyword,
        index,
      });

      // 移动到下一个位置继续查找
      index += keyword.length;
    }
  });

  // 按位置排序
  return matches.sort((a, b) => a.index - b.index);
}
