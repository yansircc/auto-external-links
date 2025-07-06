"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { SerperResponse } from "@/lib/serper/schema";
import { cn } from "@/lib/utils";
import type { EditorMessages } from "../core/messages";

interface LinkSwitcherProps {
	link: string;
	title: string | null;
	alternatives: {
		preferred: SerperResponse["organic"];
		regular: SerperResponse["organic"];
	};
	onLinkChange: (link: string, title: string) => void;
	children: React.ReactNode;
	messages: EditorMessages["linkedContent"];
}

export function LinkSwitcher({
	link,
	title,
	alternatives,
	onLinkChange,
	children,
	messages,
}: LinkSwitcherProps) {
	const [open, setOpen] = React.useState(false);
	const [showSuccess, setShowSuccess] = React.useState(false);

	// Get one link per preferred site
	const preferredLinks = alternatives.preferred.reduce<
		SerperResponse["organic"]
	>((acc, link) => {
		const domain = new URL(link.link).hostname;
		const existingLink = acc.find(
			(item) => new URL(item.link).hostname === domain,
		);
		if (!existingLink) {
			acc.push(link);
		}
		return acc;
	}, []);

	// Get top 3 regular links
	const regularLinks = alternatives.regular.slice(0, 3);

	// Combine all alternative links
	const allAlternatives = [...preferredLinks, ...regularLinks];

	const hasAlternatives = allAlternatives.length > 0;

	if (!hasAlternatives) {
		return (
			<a
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-700 underline hover:text-blue-900 group-hover:text-blue-700"
				title={title ?? undefined}
			>
				{children}
			</a>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="relative inline-flex items-center text-blue-700 underline hover:text-blue-900 group-hover:text-blue-700"
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						setOpen(true);
					}}
				>
					<a
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						title={title ?? undefined}
					>
						{children}
					</a>
					{showSuccess ? (
						<Check className="fade-in-0 zoom-in-0 ml-1 h-3 w-3 animate-in text-green-500 duration-300" />
					) : (
						<ChevronDown
							className={cn(
								"ml-1 h-3 w-3 transition-transform duration-200",
								open && "rotate-180",
							)}
						/>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[400px] p-2"
				align="start"
				sideOffset={5}
				onInteractOutside={(e) => {
					e.preventDefault();
					setOpen(false);
				}}
			>
				<div className="space-y-2">
					{allAlternatives.map((result) => {
						const isPreferred = alternatives.preferred.some(
							(p) => p.link === result.link,
						);
						return (
							<button
								key={result.link}
								type="button"
								onClick={() => {
									onLinkChange(result.link, result.title);
									setOpen(false);
									setShowSuccess(true);
									setTimeout(() => {
										setShowSuccess(false);
									}, 1000);
								}}
								className={cn(
									"block w-full rounded-lg border p-2 text-left text-sm hover:bg-accent",
									link === result.link && "border-primary",
									isPreferred && "bg-primary/5",
								)}
							>
								<div className="flex items-center justify-between">
									<div className="min-w-0 flex-1">
										<p className="line-clamp-1 font-medium">{result.title}</p>
										<p className="line-clamp-1 text-muted-foreground text-xs">
											{result.link}
										</p>
									</div>
									{isPreferred && (
										<span className="ml-2 shrink-0 text-primary text-xs">
											{messages.preferred}
										</span>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
