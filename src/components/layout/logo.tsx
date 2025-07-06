"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useKeywordAnalysis } from "@/hooks/keyword";
import SiteLogo from "@/images/site-logo.png";
import { useKeywordEditorStore } from "@/stores/keyword-editor";

export default function Logo() {
	const { startNewAnalysis } = useKeywordAnalysis();
	const shouldAnimateLogo = useKeywordEditorStore(
		(state) => state.shouldAnimateLogo,
	);

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-9 w-9 rounded-full p-0"
			onClick={startNewAnalysis}
			title="开始新的分析"
		>
			<motion.div
				animate={
					shouldAnimateLogo
						? {
								rotate: [0, -10, 10, -10, 10, 0],
								scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
							}
						: { rotate: 0, scale: 1 }
				}
				transition={{
					duration: 1,
					repeat: 2,
					repeatDelay: 1,
				}}
			>
				<Image
					src={SiteLogo}
					alt="Logo"
					width={36}
					height={36}
					className="rounded-full transition-transform hover:rotate-12"
					priority
				/>
			</motion.div>
		</Button>
	);
}
