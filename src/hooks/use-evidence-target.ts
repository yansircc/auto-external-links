import { useCallback } from "react";
import { generateEvidenceTarget } from "@/actions/citation";
import { MANUAL_EVIDENCE_TARGET_LIMIT } from "@/lib/evidence-targets";
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
export function useEvidenceTarget() {
	const {
		text,
		targetMetadata,
		setMatches,
		setTargetMetadata,
		setSelectedTargetIds,
	} = useKeywordEditorStore();

	const addEvidenceTarget = useCallback(
		async (anchorText: string) => {
			const trimmedAnchor = anchorText.trim();
			if (!trimmedAnchor) return false;

			if (!text.includes(trimmedAnchor)) return false;

			const currentTargetCount = Object.keys(targetMetadata).length;
			if (currentTargetCount >= MANUAL_EVIDENCE_TARGET_LIMIT) return false;

			const currentSettings = useAPISettingsStore.getState();
			const result = await generateEvidenceTarget(
				text,
				trimmedAnchor,
				currentSettings.apiKey || undefined,
				currentSettings.baseUrl || undefined,
				currentSettings.model || undefined,
			);

			if (result.error || !result.data) {
				console.error("Failed to generate evidence target:", result.error);
				return false;
			}

			const targetId = createEvidenceTargetId(
				trimmedAnchor,
				currentTargetCount,
			);
			const target: EvidenceTargetMetadata = {
				id: targetId,
				anchorText: trimmedAnchor,
				claim: result.data.claim,
				evidenceGap: result.data.evidenceGap,
				queries: result.data.queries,
				query: result.data.queries[0] ?? trimmedAnchor,
				citationNote: result.data.citationNote,
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
		addEvidenceTarget,
	};
}
