"use client";

import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

interface ToastOptions {
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function showToast(options: ToastOptions) {
	const { title, description, action } = options;

	toast({
		variant: "destructive",
		title,
		description,
		action: action ? (
			<ToastAction altText={action.label} onClick={action.onClick}>
				{action.label}
			</ToastAction>
		) : undefined,
	});
}

export function showAnalysisError(
	error: { code: string; message: string },
	retry?: () => void,
) {
	if (error.code === "RATE_LIMITED") {
		showToast({
			title: "访问限制",
			description: error.message,
		});
		return;
	}

	showToast({
		title: "分析失败",
		description: error.message,
		action: retry
			? {
					label: "重试",
					onClick: retry,
				}
			: undefined,
	});
}

export function showServerError(message: string, retry?: () => void) {
	showToast({
		title: "分析失败",
		description: message,
		action: retry
			? {
					label: "重试",
					onClick: retry,
				}
			: undefined,
	});
}

export function showValidationError(message: string) {
	showToast({
		title: "请选择关键词",
		description: message,
	});
}
