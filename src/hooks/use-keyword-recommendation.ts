import { useCallback } from "react";
import { generateEvidenceRecommendation } from "@/actions/recommendation";
import {
	createEvidenceTargetId,
	findEvidenceTargetsInText,
} from "@/lib/keywords";
import { useAPISettingsStore } from "@/stores/api-settings";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import type { EvidenceTargetMetadata } from "@/types/keywords";

/**
 * Hook for adding a manually selected evidence target
 */
export function useKeywordRecommendation() {
	const {
		text,
		targetMetadata,
		setMatches,
		setTargetMetadata,
		setSelectedTargetIds,
	} = useKeywordEditorStore();

	const addKeywordWithRecommendation = useCallback(
		async (anchorText: string) => {
			const trimmedAnchor = anchorText.trim();
			if (!trimmedAnchor) return false;

			if (!text.includes(trimmedAnchor)) return false;

			const currentTargetCount = Object.keys(targetMetadata).length;
			if (currentTargetCount >= 12) return false;

			const currentSettings = useAPISettingsStore.getState();
			const recommendationResult = await generateEvidenceRecommendation(
				text,
				trimmedAnchor,
				currentSettings.apiKey || undefined,
				currentSettings.baseUrl || undefined,
				currentSettings.model || undefined,
			);

			if (recommendationResult.error || !recommendationResult.data) {
				console.error(
					"Failed to generate evidence target:",
					recommendationResult.error,
				);
				return false;
			}

			const targetId = createEvidenceTargetId(
				trimmedAnchor,
				currentTargetCount,
			);
			const target: EvidenceTargetMetadata = {
				id: targetId,
				anchorText: trimmedAnchor,
				claim: recommendationResult.data.claim,
				evidenceGap: recommendationResult.data.evidenceGap,
				queries: recommendationResult.data.queries,
				query: recommendationResult.data.queries[0] ?? trimmedAnchor,
				reason: recommendationResult.data.reason,
				link: null,
				title: null,
				alternatives: { neutral: [], preferred: [], regular: [] },
			};

			const updatedMetadata = {
				...targetMetadata,
				[targetId]: target,
			};
			const updatedMatches = findEvidenceTargetsInText(
				text,
				Object.values(updatedMetadata),
			);
			const currentSelectedIds =
				useKeywordEditorStore.getState().selectedTargetIds;

			setTargetMetadata(updatedMetadata);
			setMatches(updatedMatches);
			setSelectedTargetIds(new Set([...currentSelectedIds, targetId]));

			return true;
		},
		[text, targetMetadata, setMatches, setTargetMetadata, setSelectedTargetIds],
	);

	return {
		addKeywordWithRecommendation,
	};
}
