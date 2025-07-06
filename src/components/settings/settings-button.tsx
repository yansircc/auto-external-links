"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SettingsButton() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" asChild>
						<Link href="/settings">
							<Settings className="h-[1.2rem] w-[1.2rem]" />
							<span className="sr-only">设置</span>
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>设置</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
