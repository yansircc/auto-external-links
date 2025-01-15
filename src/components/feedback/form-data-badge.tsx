"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useTheme } from "next-themes";

// 为 Form-Data 工具定义接口
interface FormDataTools {
  scan: () => void;
}

// 扩展全局 Window 接口
declare global {
  interface Window {
    _fd: FormDataTools;
  }
}

export function FormDataBadge() {
  const { theme } = useTheme();

  useEffect(() => {
    // 确保 _fd 已经加载
    if (typeof window !== "undefined" && window._fd) {
      window._fd.scan();
    }
  }, []);

  return (
    <>
      <Script
        src="https://static.form-data.com/js/form-data-tools.v1.min.js"
        strategy="lazyOnload"
      />

      <div className="mt-8 flex items-center justify-center text-sm">
        <a
          href="https://form-data.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <div
            className="form-data-powered-by scale-90"
            data-formdata-lang="zh_CN"
            data-formdata-theme={theme === "dark" ? "dark" : "light"}
          />
        </a>
      </div>
    </>
  );
}
