"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeywordRecommendation } from "@/hooks/use-keyword-recommendation";
import { useToast } from "@/hooks/use-toast";
import { useKeywordEditorStore } from "@/stores/keyword-editor";

interface AddKeywordProps {
	onAdd?: () => void;
}

export function AddKeyword({ onAdd }: AddKeywordProps) {
	const [anchorText, setAnchorText] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const { toast } = useToast();
	const store = useKeywordEditorStore();
	const { text, targetMetadata } = store;
	const { addKeywordWithRecommendation } = useKeywordRecommendation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedAnchor = anchorText.trim();
		if (!trimmedAnchor) return;

		if (!text.includes(trimmedAnchor)) {
			toast({
				title: "锚点未找到",
				description: "该锚点文本在文章中不存在",
				variant: "destructive",
			});
			return;
		}

		if (Object.keys(targetMetadata).length >= 12) {
			toast({
				title: "已达到证据目标数量上限",
				description: "每篇文章最多只能有12个证据目标",
				variant: "destructive",
			});
			return;
		}

		const success = await addKeywordWithRecommendation(trimmedAnchor);

		if (success) {
			setAnchorText("");
			setIsAdding(false);

			toast({
				title: "证据目标已添加",
				description: `"${trimmedAnchor}" 已成功添加到列表中`,
			});

			onAdd?.();
		} else {
			toast({
				title: "添加失败",
				description: "无法添加该证据目标",
				variant: "destructive",
			});
		}
	};

	if (!isAdding) {
		return (
			<Button
				type="button"
				variant="secondary"
				size="sm"
				onClick={() => setIsAdding(true)}
				className="gap-1.5 shadow-sm transition-shadow hover:shadow-md"
			>
				<Plus className="h-4 w-4" />
				手动添加
			</Button>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				type="text"
				value={anchorText}
				onChange={(e) => setAnchorText(e.target.value)}
				placeholder="输入锚点文本..."
				className="h-8 text-sm"
				autoFocus
				onBlur={() => {
					if (!anchorText.trim()) {
						setIsAdding(false);
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setAnchorText("");
						setIsAdding(false);
					}
				}}
			/>
			<Button type="submit" size="sm" className="h-8">
				添加
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8"
				onClick={() => {
					setAnchorText("");
					setIsAdding(false);
				}}
			>
				取消
			</Button>
		</form>
	);
}
