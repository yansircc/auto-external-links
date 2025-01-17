import { auth } from "@/auth";
import { NextResponse } from "next/server";

// 导出 auth 函数作为默认中间件
export default auth((req) => {
  const isAuthPage =
    req.nextUrl?.pathname === "/login" || req.nextUrl?.pathname === "/register";

  // 如果用户已登录且尝试访问登录/注册页面，重定向到首页
  if (req.auth?.user && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
