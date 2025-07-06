"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useKeywordEditorStore } from "@/stores/keyword-editor";

interface SelectionPosition {
	x: number;
	y: number;
}

export function TextSelectionPopover() {
	const [selectedText, setSelectedText] = useState("");
	const [position, setPosition] = useState<SelectionPosition | null>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const { toast } = useToast();
	const { keywordMetadata, addUserKeyword } = useKeywordEditorStore();

	useEffect(() => {
		const handleSelectionChange = () => {
			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0) {
				setPosition(null);
				return;
			}

			const selectedStr = selection.toString().trim();
			if (!selectedStr || selectedStr.length < 2) {
				setPosition(null);
				return;
			}

			// 检查选择是否在编辑器内
			const range = selection.getRangeAt(0);
			const container = range.commonAncestorContainer;
			const editorElement = document.querySelector(
				'[data-editor-content="true"]',
			);
			if (!editorElement || !editorElement.contains(container)) {
				setPosition(null);
				return;
			}

			// 获取选择区域的位置
			const rect = range.getBoundingClientRect();
			setSelectedText(selectedStr);
			setPosition({
				x: rect.left + rect.width / 2,
				y: rect.top - 10,
			});
		};

		// 监听选择变化
		document.addEventListener("selectionchange", handleSelectionChange);
		// 监听鼠标抬起（选择完成）
		document.addEventListener("mouseup", handleSelectionChange);

		return () => {
			document.removeEventListener("selectionchange", handleSelectionChange);
			document.removeEventListener("mouseup", handleSelectionChange);
		};
	}, []);

	// 点击外部关闭
	useEffect(() => {
		if (!position) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node)
			) {
				setPosition(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [position]);

	const handleAddKeyword = () => {
		if (!selectedText) return;

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
			setPosition(null);
			return;
		}

		// 添加关键词
		addUserKeyword(selectedText);

		// 显示成功消息
		toast({
			title: "关键词已添加",
			description: `"${selectedText}" 已成功添加到列表中`,
		});

		// 清除选择
		window.getSelection()?.removeAllRanges();
		setPosition(null);
	};

	const handleCancel = () => {
		window.getSelection()?.removeAllRanges();
		setPosition(null);
	};

	if (!position) return null;

	return (
		<div
			ref={popoverRef}
			className="fade-in-0 slide-in-from-bottom-2 fixed z-50 animate-in duration-200"
			style={{
				left: position.x,
				top: position.y,
				transform: "translate(-50%, -100%)",
			}}
		>
			<div className="rounded-lg border bg-popover/95 p-3 shadow-xl backdrop-blur-sm">
				<div className="mb-3 max-w-[200px] text-center">
					<p className="mb-1 text-muted-foreground text-xs">添加关键词</p>
					<p className="truncate font-medium text-sm">"{selectedText}"</p>
				</div>
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="default"
						onClick={handleAddKeyword}
						className="h-8 gap-1.5 px-3 font-medium text-xs"
					>
						<Check className="h-3.5 w-3.5" />
						确认添加
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={handleCancel}
						className="h-8 gap-1.5 px-3 text-xs"
					>
						取消
					</Button>
				</div>
			</div>
			{/* 小三角指示器 */}
			<div
				className="-translate-x-1/2 absolute left-1/2 h-0 w-0 border-t-[6px] border-t-border border-r-[6px] border-r-transparent border-l-[6px] border-l-transparent"
				style={{ bottom: "-6px" }}
			/>
		</div>
	);
}
