"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useKeywordRecommendation } from "@/hooks/use-keyword-recommendation";
import { useToast } from "@/hooks/use-toast";
import { useKeywordEditorStore } from "@/stores/keyword-editor";

export function TextSelectionPopover() {
	const [selectedText, setSelectedText] = useState("");
	const [showPopover, setShowPopover] = useState(false);
	const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
	const [isLoading, setIsLoading] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);
	const { toast } = useToast();
	const { keywordMetadata } = useKeywordEditorStore();
	const { addKeywordWithRecommendation } = useKeywordRecommendation();

	useEffect(() => {
		const handleMouseUp = () => {
			setTimeout(() => {
				const selection = window.getSelection();
				const text = selection?.toString().trim() || "";

				if (text && text.length >= 2) {
					const range = selection?.getRangeAt(0);
					const rect = range?.getBoundingClientRect();

					if (rect) {
						setSelectedText(text);
						setPopoverPosition({
							x: rect.left + rect.width / 2,
							y: rect.top,
						});
						setShowPopover(true);
					}
				} else {
					setShowPopover(false);
				}
			}, 10); // 小延迟确保选择完成
		};

		document.addEventListener("mouseup", handleMouseUp);
		return () => document.removeEventListener("mouseup", handleMouseUp);
	}, []);

	// 点击外部关闭
	useEffect(() => {
		if (!showPopover) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node)
			) {
				setShowPopover(false);
				window.getSelection()?.removeAllRanges();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showPopover]);

	const handleAddKeyword = async () => {
		// 检查是否已存在
		const existingKeyword = Object.keys(keywordMetadata).find(
			(k) => k.toLowerCase() === selectedText.toLowerCase(),
		);

		if (existingKeyword) {
			toast({
				title: "关键词已存在",
				description: `"${existingKeyword}" 已经在列表中了`,
				variant: "destructive",
			});
			setShowPopover(false);
			window.getSelection()?.removeAllRanges();
			return;
		}

		// 检查关键词总数是否已达到上限
		if (Object.keys(keywordMetadata).length >= 20) {
			toast({
				title: "已达到关键词数量上限",
				description: "每篇文章最多只能有20个关键词",
				variant: "destructive",
			});
			setShowPopover(false);
			window.getSelection()?.removeAllRanges();
			return;
		}

		// 设置加载状态
		setIsLoading(true);

		// 添加关键词
		const success = await addKeywordWithRecommendation(selectedText);

		if (success) {
			toast({
				title: "关键词已添加",
				description: `"${selectedText}" 已成功添加到列表中`,
			});
		} else {
			toast({
				title: "添加失败",
				description: "无法添加该关键词",
				variant: "destructive",
			});
		}

		// 清除选择
		setIsLoading(false);
		window.getSelection()?.removeAllRanges();
		setShowPopover(false);
	};

	if (!showPopover) return null;

	return (
		<div
			ref={popoverRef}
			className="fade-in-0 slide-in-from-bottom-2 fixed z-[100] animate-in duration-200"
			style={{
				left: `${popoverPosition.x}px`,
				top: `${popoverPosition.y}px`,
				transform: "translate(-50%, -100%) translateY(-10px)",
			}}
		>
			<div className="rounded-lg border bg-popover/95 p-3 shadow-xl backdrop-blur-sm">
				<div className="mb-3 max-w-[200px] text-center">
					<p className="mb-1 text-muted-foreground text-xs">添加关键词</p>
					<p className="truncate font-medium text-sm">"{selectedText}"</p>
				</div>
				<div className="flex justify-center gap-2">
					<Button
						size="sm"
						variant="default"
						onClick={handleAddKeyword}
						disabled={isLoading}
						className="h-8 gap-1.5 px-3 font-medium text-xs"
					>
						{isLoading ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<Check className="h-3.5 w-3.5" />
						)}
						{isLoading ? "生成中..." : "确认添加"}
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							setShowPopover(false);
							window.getSelection()?.removeAllRanges();
						}}
						className="h-8 gap-1.5 px-3 text-xs"
					>
						取消
					</Button>
				</div>
			</div>
		</div>
	);
}
