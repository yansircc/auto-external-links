import type { EvidenceMatch, EvidenceTargetMetadata } from "../core/schema";
import type { Footnote } from "../core/types";

interface FootnotesResult {
	footnotes: Footnote[];
	footnoteIndexMap: Map<string, number>;
}

function formatCitationNote(metadata: EvidenceTargetMetadata): string {
	const { citationNote, title, link } = metadata;
	const sourceLabel = title ? `"${title}"` : "The linked source";
	const sourceRef = link ? `${sourceLabel}, ${link}` : sourceLabel;
	const limitation = citationNote.limitation
		? ` Scope note: ${citationNote.limitation}`
		: "";

	return `${sourceRef}. ${citationNote.citationText} Evidence role: ${citationNote.evidenceRole}; source type: ${citationNote.sourceType}. Supports: ${citationNote.supportsClaim}.${limitation}`;
}

export function useFootnotes(
	matches: EvidenceMatch[],
	selectedTargetIds: Set<string>,
	targetMetadata: Record<string, EvidenceTargetMetadata>,
): FootnotesResult {
	const footnotes: Footnote[] = Array.from(
		matches.reduce((map, match) => {
			if (!selectedTargetIds.has(match.targetId)) return map;

			const metadata = targetMetadata[match.targetId];
			if (!metadata?.link || !metadata.citationNote) return map;

			const existing = map.get(match.targetId);
			if (existing) {
				existing.referenceIds.push(match.id);
				return map;
			}

			map.set(match.targetId, {
				label: match.anchorText,
				citation: formatCitationNote(metadata),
				referenceIds: [match.id],
			});
			return map;
		}, new Map<string, Footnote>()),
	).map(([_, footnote]) => footnote);

	const footnoteIndexMap = new Map(
		footnotes.flatMap((footnote, index) =>
			footnote.referenceIds.map((id) => [id, index + 1]),
		),
	);

	return { footnotes, footnoteIndexMap };
}
