"use client";

import { AlertCircle } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ErrorHandler, isErrorWithMessage } from "./handler";

interface Props {
	children: ReactNode;
	fallback?: (error: Error, reset: () => void) => ReactNode;
	onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * React 错误边界组件
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
		// 记录错误
		ErrorHandler.log(error, {
			componentStack: errorInfo.componentStack,
			location: "ErrorBoundary",
		});

		// 调用自定义错误处理器
		this.props.onError?.(error, errorInfo);
	}

	reset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			// 使用自定义 fallback
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.reset);
			}

			// 默认错误界面
			return (
				<DefaultErrorFallback error={this.state.error} reset={this.reset} />
			);
		}

		return this.props.children;
	}
}

/**
 * 默认错误展示组件
 */
function DefaultErrorFallback({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	const message = isErrorWithMessage(error) ? error.message : "发生了未知错误";

	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center p-4">
			<div className="max-w-md text-center">
				<AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />

				<h2 className="mb-2 font-semibold text-lg">出错了</h2>

				<p className="mb-4 text-muted-foreground text-sm">{message}</p>

				{/* Show error details only in development */}
				{typeof window !== "undefined" &&
					window.location.hostname === "localhost" && (
						<details className="mb-4 text-left">
							<summary className="cursor-pointer text-muted-foreground text-xs">
								错误详情
							</summary>
							<pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
								{error.stack}
							</pre>
						</details>
					)}

				<div className="flex justify-center gap-2">
					<Button onClick={reset} variant="default" size="sm">
						重试
					</Button>

					<Button
						onClick={() => window.location.reload()}
						variant="outline"
						size="sm"
					>
						刷新页面
					</Button>
				</div>
			</div>
		</div>
	);
}

/**
 * 用于异步组件的错误边界 HOC
 */
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	errorBoundaryProps?: Omit<Props, "children">,
) {
	const WrappedComponent = (props: P) => (
		<ErrorBoundary {...errorBoundaryProps}>
			<Component {...props} />
		</ErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

	return WrappedComponent;
}
