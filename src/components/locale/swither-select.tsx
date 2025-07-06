"use client";

import { Languages } from "lucide-react";
import { useTransition } from "react";
import { setUserLocale } from "@/actions/locale";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type Props = {
	defaultValue: string;
	items: Array<{ value: string; label: string }>;
	label: string;
};

export default function LocaleSwitcherSelect({
	defaultValue,
	items,
	label,
}: Props) {
	const [isPending, startTransition] = useTransition();

	function onChange(value: string) {
		const locale = value as Locale;
		startTransition(async () => {
			await setUserLocale(locale);
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"h-9 w-9",
						isPending && "pointer-events-none opacity-60",
					)}
					aria-label={label}
				>
					<Languages className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{items.map((item) => (
					<DropdownMenuItem
						key={item.value}
						onSelect={() => onChange(item.value)}
						className={cn(
							"cursor-pointer",
							defaultValue === item.value && "font-medium",
						)}
					>
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
