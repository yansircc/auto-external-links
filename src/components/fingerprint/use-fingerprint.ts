"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useEffect, useState } from "react";

const STORAGE_KEY = "visitor-fingerprint";

/**
 * React Hook，用于生成和缓存浏览器指纹
 * @returns 浏览器指纹
 */
export function useFingerprint() {
	const [fingerprint, setFingerprint] = useState<string | null>(() => {
		// 尝试从 localStorage 获取缓存的指纹
		if (typeof window !== "undefined") {
			return localStorage.getItem(STORAGE_KEY);
		}
		return null;
	});

	useEffect(() => {
		let mounted = true;

		async function initFingerprint() {
			try {
				// 如果已经有缓存的指纹，就不再重新生成
				if (fingerprint) return;

				// 初始化 FingerprintJS
				const fp = await FingerprintJS.load();

				// 生成指纹
				const result = await fp.get();
				const visitorId = result.visitorId;

				// 如果组件已卸载，不再更新状态
				if (!mounted) return;

				// 缓存指纹
				localStorage.setItem(STORAGE_KEY, visitorId);
				setFingerprint(visitorId);
			} catch (error) {
				console.error("生成指纹失败:", error);
			}
		}

		void initFingerprint();

		return () => {
			mounted = false;
		};
	}, [fingerprint]);

	return fingerprint;
}
