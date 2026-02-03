import type { KeywordMatch } from "@/types/keywords";

/**
 * 创建唯一的关键词标识符
 * @param keyword - 关键词
 * @param index - 位置索引
 * @returns 唯一标识符
 */
export function createKeywordId(keyword: string, index: number): string {
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
 * 检查位置是否在Markdown图片语法的alt或title中
 * @param text - 完整文本
 * @param position - 要检查的位置
 * @returns 是否在Markdown图片中
 */
function isInsideMarkdownImage(text: string, position: number): boolean {
	// 向前查找最近的图片起始标记
	const beforeText = text.slice(0, position);
	const lastImageStart = beforeText.lastIndexOf("![");

	if (lastImageStart === -1) return false;

	// 查找对应的图片结束标记
	const afterImageStart = text.slice(lastImageStart + 2);
	const linkStart = afterImageStart.indexOf("](");

	if (linkStart === -1) return false;

	const imageAltEnd = lastImageStart + 2 + linkStart;
	const linkEnd = afterImageStart.indexOf(")", linkStart + 2);

	if (linkEnd === -1) return false;

	const imageEnd = lastImageStart + 2 + linkEnd + 1;

	// 检查当前位置是否在图片范围内
	// 特别检查是否在alt文本或title中
	if (position >= imageAltEnd && position <= imageEnd) {
		// 在链接部分，检查是否在title引号内
		const linkText = text.slice(imageAltEnd, imageEnd - 1);
		const titleMatch = linkText.match(/"([^"]*)"/);
		if (titleMatch) {
			const titleStart = imageAltEnd + linkText.indexOf('"') + 1;
			const titleEnd = titleStart + (titleMatch[1]?.length ?? 0);
			return position >= titleStart && position <= titleEnd;
		}
		return true; // 在链接URL中
	}

	return position >= lastImageStart && position < imageAltEnd; // 在alt文本中
}

/**
 * 在文本中查找关键词的位置
 * @param text - 原始文本
 * @param keywords - 要查找的关键词列表
 * @returns 符合新类型定义的关键词匹配数组
 */
export function findKeywordsInText(
	text: string,
	keywords: string[],
): KeywordMatch[] {
	const matches: KeywordMatch[] = [];

	// 对每个关键词进行查找
	for (const keyword of keywords) {
		let searchIndex = 0;
		let instanceIndex = 0;

		while (true) {
			// 从当前位置开始查找关键词
			const foundIndex = text.indexOf(keyword, searchIndex);
			if (foundIndex === -1) break;

			// 检查找到的关键词是否在Markdown图片的alt或title中
			const isInsideImage = Array.from({ length: keyword.length }, (_, i) =>
				isInsideMarkdownImage(text, foundIndex + i),
			).some(Boolean);

			// 如果关键词在Markdown图片中，跳过这个匹配
			if (isInsideImage) {
				searchIndex = foundIndex + keyword.length;
				continue;
			}

			// 添加匹配信息，符合新的类型定义
			matches.push({
				id: createKeywordId(keyword, instanceIndex),
				keyword,
				start: foundIndex,
				end: foundIndex + keyword.length,
			});

			// 移动到下一个位置继续查找
			searchIndex = foundIndex + keyword.length;
			instanceIndex++;
		}
	}

	// 按位置排序
	return matches.sort((a, b) => a.start - b.start);
}
