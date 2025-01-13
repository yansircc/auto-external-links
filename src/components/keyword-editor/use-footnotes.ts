import { type KeywordMatch, type KeywordMetadata } from "@/app/schema";
import { createKeywordId } from "@/lib/keywords";
import { type Footnote } from "./types";

interface FootnotesResult {
  footnotes: Footnote[];
  footnoteIndexMap: Map<string, number>;
}

export function useFootnotes(
  matches: KeywordMatch[],
  selectedKeywordIds: Set<string>,
  keywordMetadata: Record<string, KeywordMetadata>,
): FootnotesResult {
  // Generate deduplicated footnotes for selected keywords
  const footnotes: Footnote[] = Array.from(
    matches.reduce((map, match, index) => {
      const id = createKeywordId(match.keyword, index);
      if (!selectedKeywordIds.has(id)) return map;

      const metadata = keywordMetadata[match.keyword];
      if (!metadata?.link || !metadata.reason) return map;

      const existing = map.get(match.keyword);
      if (existing) {
        // Add this instance's ID to existing footnote
        existing.referenceIds.push(id);
        return map;
      }

      // Create new footnote
      map.set(match.keyword, {
        keyword: match.keyword,
        reason: metadata.reason,
        link: metadata.link,
        referenceIds: [id],
      });
      return map;
    }, new Map<string, Footnote>()),
  ).map(([_, footnote]) => footnote);

  // Create a map of ID to footnote index for quick lookup
  const footnoteIndexMap = new Map(
    footnotes.flatMap((footnote, index) =>
      footnote.referenceIds.map((id) => [id, index + 1]),
    ),
  );

  return { footnotes, footnoteIndexMap };
}
