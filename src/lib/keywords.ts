// 关键词匹配
interface KeywordMatch {
	keyword: string;
	index: number;
}

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
	const lastHyphenIndex = id.lastIndexOf("-");
	if (lastHyphenIndex === -1) return id;
	return id.slice(0, lastHyphenIndex);
}

/**
 * 从选中的关键词ID中获取唯一的关键词列表
 * @param selectedIds - 选中的关键词ID集合
 * @returns 唯一的关键词列表
 */
export function getUniqueSelectedKeywords(selectedIds: Set<string>): string[] {
	return Array.from(new Set(Array.from(selectedIds).map(extractKeywordFromId)));
}

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
	for (const keyword of keywords) {
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
	}

	// 按位置排序
	return matches.sort((a, b) => a.index - b.index);
}
