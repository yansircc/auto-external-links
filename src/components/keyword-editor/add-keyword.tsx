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
	const [keyword, setKeyword] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const { toast } = useToast();
	const { text, keywordMetadata } = useKeywordEditorStore();
	const { addKeywordWithRecommendation } = useKeywordRecommendation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedKeyword = keyword.trim();
		if (!trimmedKeyword) return;

		// 检查是否已存在
		if (keywordMetadata[trimmedKeyword]) {
			toast({
				title: "关键词已存在",
				description: "该关键词已经在列表中了",
				variant: "destructive",
			});
			return;
		}

		// 检查关键词总数是否已达到上限
		if (Object.keys(keywordMetadata).length >= 20) {
			toast({
				title: "已达到关键词数量上限",
				description: "每篇文章最多只能有20个关键词",
				variant: "destructive",
			});
			return;
		}

		// 检查关键词是否在文本中存在
		if (!text.toLowerCase().includes(trimmedKeyword.toLowerCase())) {
			toast({
				title: "关键词未找到",
				description: "该关键词在文本中不存在",
				variant: "destructive",
			});
			return;
		}

		// 添加关键词
		const success = await addKeywordWithRecommendation(trimmedKeyword);

		if (success) {
			// 重置输入
			setKeyword("");
			setIsAdding(false);

			// 显示成功消息
			toast({
				title: "关键词已添加",
				description: `"${trimmedKeyword}" 已成功添加到列表中`,
			});

			// 调用回调
			onAdd?.();
		} else {
			toast({
				title: "添加失败",
				description: "无法添加该关键词",
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
				value={keyword}
				onChange={(e) => setKeyword(e.target.value)}
				placeholder="输入关键词..."
				className="h-8 text-sm"
				autoFocus
				onBlur={() => {
					if (!keyword.trim()) {
						setIsAdding(false);
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setKeyword("");
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
					setKeyword("");
					setIsAdding(false);
				}}
			>
				取消
			</Button>
		</form>
	);
}
