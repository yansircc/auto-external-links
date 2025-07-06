"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EditorLayoutProps {
	children: React.ReactNode;
	className?: string;
}

const variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

export function EditorLayout({ children, className }: EditorLayoutProps) {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			exit="exit"
			variants={variants}
			transition={{ duration: 0.2 }}
			className={cn("flex min-h-[240px] flex-col", className)}
		>
			{children}
		</motion.div>
	);
}

export function EditorActions({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			className="mt-auto flex justify-end space-x-2 pt-4"
		>
			{children}
		</motion.div>
	);
}
