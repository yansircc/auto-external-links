"use client";

import {
	CheckCircle2,
	Eye,
	EyeOff,
	Loader2,
	Lock,
	Save,
	Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { validateAPIConfiguration } from "@/actions/validate-api";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAPISettingsStore } from "@/stores/api-settings";

export function APISettings() {
	const { toast } = useToast();
	const {
		apiKey,
		baseUrl,
		model,
		provider,
		setAPIKey,
		setBaseUrl,
		setModel,
		setProvider,
	} = useAPISettingsStore();

	const [localApiKey, setLocalApiKey] = useState(apiKey || "");
	const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl);
	const [localModel, setLocalModel] = useState(model);
	const [showApiKey, setShowApiKey] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [isValidating, setIsValidating] = useState(false);

	useEffect(() => {
		// 检查是否有更改
		const changed =
			localApiKey !== (apiKey || "") ||
			localModel !== model ||
			(provider === "custom" && localBaseUrl !== baseUrl);
		setHasChanges(changed);
	}, [localApiKey, localBaseUrl, localModel, apiKey, baseUrl, model, provider]);

	const handleSave = () => {
		// 验证 API key
		if (!localApiKey.trim()) {
			toast({
				title: "请输入 API Key",
				description: "API Key 不能为空",
				variant: "destructive",
			});
			return;
		}

		// 验证自定义 base URL
		if (provider === "custom" && !localBaseUrl.trim()) {
			toast({
				title: "请输入 Base URL",
				description: "使用第三方服务时需要提供 Base URL",
				variant: "destructive",
			});
			return;
		}

		// 验证模型名称
		if (!localModel.trim()) {
			toast({
				title: "请输入模型名称",
				description: "模型名称不能为空",
				variant: "destructive",
			});
			return;
		}

		// 保存设置
		setAPIKey(localApiKey.trim());
		setModel(localModel.trim());
		if (provider === "custom") {
			setBaseUrl(localBaseUrl.trim());
		}

		toast({
			title: "设置已保存",
			description: "API 设置已保存到本地浏览器",
		});
		setHasChanges(false);
	};

	const handleProviderChange = (value: "openai" | "custom") => {
		setProvider(value);
		if (value === "openai") {
			setLocalBaseUrl("https://api.openai.com/v1");
		}
	};

	const handleValidate = async () => {
		// 验证前先检查必填项
		if (!localApiKey.trim()) {
			toast({
				title: "请输入 API Key",
				description: "需要 API Key 才能进行验证",
				variant: "destructive",
			});
			return;
		}

		if (!localModel.trim()) {
			toast({
				title: "请输入模型名称",
				description: "需要模型名称才能进行验证",
				variant: "destructive",
			});
			return;
		}

		setIsValidating(true);

		try {
			const result = await validateAPIConfiguration(
				localApiKey.trim(),
				provider === "custom" ? localBaseUrl.trim() : undefined,
				localModel.trim(),
			);

			if (result.success) {
				toast({
					title: "验证成功",
					description: (
						<div className="space-y-1">
							<p>{result.message}</p>
							{result.details && (
								<p className="text-muted-foreground text-xs">
									提供商: {result.details.provider} | 模型:{" "}
									{result.details.model} | 响应时间:{" "}
									{result.details.responseTime}ms
								</p>
							)}
						</div>
					),
				});
			} else {
				toast({
					title: "验证失败",
					description: result.message,
					variant: "destructive",
				});
			}
		} catch (_error) {
			toast({
				title: "验证失败",
				description: "验证过程中发生错误",
				variant: "destructive",
			});
		} finally {
			setIsValidating(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					API 设置
				</CardTitle>
				<CardDescription>
					配置您的 OpenAI API Key 以使用 AI 功能
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 安全提示 */}
				<div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
					<Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />
					<div className="space-y-1 text-sm">
						<p className="font-medium">您的 API Key 是安全的</p>
						<p className="text-muted-foreground">
							API Key 仅保存在您的浏览器本地存储中，不会上传到服务器或数据库。
						</p>
					</div>
				</div>

				{/* 服务提供商选择 */}
				<div className="space-y-3">
					<Label>服务提供商</Label>
					<RadioGroup value={provider} onValueChange={handleProviderChange}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="openai" id="openai" />
							<Label htmlFor="openai" className="cursor-pointer font-normal">
								OpenAI 官方
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="custom" id="custom" />
							<Label htmlFor="custom" className="cursor-pointer font-normal">
								第三方兼容服务
							</Label>
						</div>
					</RadioGroup>
				</div>

				{/* API Key 输入 */}
				<div className="space-y-2">
					<Label htmlFor="api-key">API Key</Label>
					<div className="relative">
						<Input
							id="api-key"
							type={showApiKey ? "text" : "password"}
							value={localApiKey}
							onChange={(e) => setLocalApiKey(e.target.value)}
							placeholder="sk-..."
							className="pr-10"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
							onClick={() => setShowApiKey(!showApiKey)}
						>
							{showApiKey ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				{/* 模型名称 */}
				<div className="space-y-2">
					<Label htmlFor="model">模型名称</Label>
					<Input
						id="model"
						type="text"
						value={localModel}
						onChange={(e) => setLocalModel(e.target.value)}
						placeholder={
							provider === "openai" ? "gpt-4o-mini" : "your-model-name"
						}
					/>
					<p className="text-muted-foreground text-xs">
						{provider === "openai"
							? "默认使用 gpt-4o-mini，您也可以使用其他模型如 gpt-4, gpt-3.5-turbo 等"
							: "请输入第三方服务支持的模型名称"}
					</p>
				</div>

				{/* 自定义 Base URL */}
				{provider === "custom" && (
					<div className="space-y-2">
						<Label htmlFor="base-url">Base URL</Label>
						<Input
							id="base-url"
							type="url"
							value={localBaseUrl}
							onChange={(e) => setLocalBaseUrl(e.target.value)}
							placeholder="https://api.example.com/v1"
						/>
						<p className="text-muted-foreground text-xs">
							请输入兼容 OpenAI API 的第三方服务地址
						</p>
					</div>
				)}

				{/* 操作按钮 */}
				<div className="flex gap-2">
					<Button
						onClick={handleValidate}
						disabled={isValidating || !localApiKey || !localModel}
						variant="outline"
						className="flex-1"
					>
						{isValidating ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								验证中...
							</>
						) : (
							<>
								<CheckCircle2 className="mr-2 h-4 w-4" />
								验证配置
							</>
						)}
					</Button>
					<Button
						onClick={handleSave}
						disabled={!hasChanges}
						className="flex-1"
					>
						<Save className="mr-2 h-4 w-4" />
						保存设置
					</Button>
				</div>

				{/* 使用提示 */}
				<div className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
					<p className="mb-2 font-medium">如何获取 API Key？</p>
					<ol className="list-decimal space-y-1 pl-4">
						<li>
							访问{" "}
							<a
								href="https://platform.openai.com"
								target="_blank"
								rel="noopener noreferrer"
								className="underline"
							>
								OpenAI Platform
							</a>
						</li>
						<li>登录或创建账号</li>
						<li>前往 API Keys 页面</li>
						<li>创建新的 API Key</li>
					</ol>
				</div>
			</CardContent>
		</Card>
	);
}
