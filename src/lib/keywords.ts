import type { EvidenceMatch, EvidenceTargetMetadata } from "@/types/keywords";

/**
 * 创建证据目标标识符
 */
export function createEvidenceTargetId(
	anchorText: string,
	index: number,
): string {
	const slug = anchorText
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 48);

	return `evidence-${slug || "target"}-${index}`;
}

/**
 * 检查位置是否在 Markdown 图片语法中
 */
function isInsideMarkdownImage(text: string, position: number): boolean {
	const beforeText = text.slice(0, position);
	const lastImageStart = beforeText.lastIndexOf("![");

	if (lastImageStart === -1) return false;

	const afterImageStart = text.slice(lastImageStart + 2);
	const linkStart = afterImageStart.indexOf("](");

	if (linkStart === -1) return false;

	const linkEnd = afterImageStart.indexOf(")", linkStart + 2);

	if (linkEnd === -1) return false;

	const imageEnd = lastImageStart + 2 + linkEnd + 1;

	return position >= lastImageStart && position <= imageEnd;
}

function overlapsExistingMatch(
	start: number,
	end: number,
	matches: EvidenceMatch[],
) {
	return matches.some((match) => start < match.end && end > match.start);
}

/**
 * 从证据目标中派生文章内锚点位置
 */
export function findEvidenceTargetsInText(
	text: string,
	targets: EvidenceTargetMetadata[],
): EvidenceMatch[] {
	const matches: EvidenceMatch[] = [];

	for (const target of targets) {
		const anchorText = target.anchorText;
		let searchIndex = 0;

		while (true) {
			const start = text.indexOf(anchorText, searchIndex);
			if (start === -1) break;

			const end = start + anchorText.length;
			const isInsideImage = Array.from(
				{ length: anchorText.length },
				(_, index) => isInsideMarkdownImage(text, start + index),
			).some(Boolean);

			if (!isInsideImage && !overlapsExistingMatch(start, end, matches)) {
				matches.push({
					id: target.id,
					targetId: target.id,
					anchorText,
					start,
					end,
				});
				break;
			}

			searchIndex = end;
		}
	}

	return matches.sort((a, b) => a.start - b.start);
}
