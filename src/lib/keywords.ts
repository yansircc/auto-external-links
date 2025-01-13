/**
 * 创建唯一的关键词标识符
 * @param keyword - 关键词
 * @param index - 位置索引
 * @returns 唯一标识符
 */
export function createKeywordId(keyword: string, index: number) {
  return `${keyword}-${index}`;
}

/**
 * 从关键词 ID 中提取关键词
 * @param id - 关键词 ID
 * @returns 关键词
 */
export function extractKeywordFromId(id: string): string {
  const [keyword = ""] = id.split("-");
  return keyword;
}

/**
 * 从选中的关键词ID中获取唯一的关键词列表
 * @param selectedIds - 选中的关键词ID集合
 * @returns 唯一的关键词列表
 */
export function getUniqueSelectedKeywords(selectedIds: Set<string>): string[] {
  return Array.from(new Set(Array.from(selectedIds).map(extractKeywordFromId)));
}
