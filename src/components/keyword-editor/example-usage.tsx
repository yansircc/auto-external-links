"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKeywordAnalysis, useKeywordSelection } from "@/hooks/keyword";
import { useKeywordEditorStore } from "@/stores/keyword-editor-v2";

/**
 * 使用新架构的示例组件
 * 展示如何使用 Hooks 和纯 Store
 */
export function KeywordEditorExample() {
	// 业务逻辑通过 Hooks
	const { analyzeText, fetchLinks, isLoading, mode, canFetchLinks } =
		useKeywordAnalysis();

	// 选择管理通过专门的 Hook
	const {
		matches,
		selectionStats,
		toggleSelectAll,
		handleToggleKeyword,
		isKeywordSelected,
	} = useKeywordSelection();

	// 纯状态通过 Store（选择性订阅）
	const text = useKeywordEditorStore((state) => state.text);
	const setText = useKeywordEditorStore((state) => state.setText);

	// 处理表单提交
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!text.trim()) {
			return;
		}

		// 调用业务逻辑 Hook
		await analyzeText({ text });
	};

	// 渲染不同模式
	if (mode === "editing") {
		return (
			<form onSubmit={handleSubmit} className="space-y-4">
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="输入要分析的文本..."
					className="h-40 w-full rounded-lg border p-4"
					disabled={isLoading}
				/>

				<Button type="submit" disabled={isLoading || !text.trim()}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							分析中...
						</>
					) : (
						"分析文本"
					)}
				</Button>
			</form>
		);
	}

	if (mode === "preview") {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg">
						找到 {selectionStats.totalKeywords} 个关键词
					</h3>

					<Button variant="outline" size="sm" onClick={toggleSelectAll}>
						{selectionStats.isAllSelected ? "取消全选" : "全选"}
					</Button>
				</div>

				<div className="space-y-2">
					{matches.map((match) => (
						<label
							key={match.id}
							className="flex cursor-pointer items-center space-x-2"
						>
							<input
								type="checkbox"
								checked={isKeywordSelected(match.id)}
								onChange={() => handleToggleKeyword(match.id)}
							/>
							<span>{match.keyword}</span>
						</label>
					))}
				</div>

				<Button onClick={fetchLinks} disabled={!canFetchLinks || isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							获取链接...
						</>
					) : (
						`为 ${selectionStats.selectedCount} 个关键词生成链接`
					)}
				</Button>
			</div>
		);
	}

	if (mode === "linked") {
		return (
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">链接生成完成</h3>

				{/* 这里展示生成的链接 */}
				<div className="space-y-2">
					{matches.map((match) => {
						const metadata =
							useKeywordEditorStore.getState().keywordMetadata[match.keyword];

						if (!metadata?.link) return null;

						return (
							<div key={match.id} className="rounded-lg border p-4">
								<div className="font-medium">{match.keyword}</div>
								<a
									href={metadata.link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 text-sm hover:underline"
								>
									{metadata.title}
								</a>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	return null;
}

/**
 * 展示如何使用错误边界
 */
import { ErrorBoundary } from "@/lib/errors/error-boundary";

export function KeywordEditorWithErrorBoundary() {
	return (
		<ErrorBoundary
			fallback={(error, reset) => (
				<div className="py-8 text-center">
					<p className="mb-4 text-red-600">出错了：{error.message}</p>
					<Button onClick={reset}>重试</Button>
				</div>
			)}
		>
			<KeywordEditorExample />
		</ErrorBoundary>
	);
}
