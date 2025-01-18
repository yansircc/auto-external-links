import { auth } from "@/server/auth";
import { catchError } from "@/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 需要认证的路径
const AUTH_PATHS = ["/dashboard", "/settings", "/api/user"];
// 认证相关路径（需要特殊处理的路径）
const AUTH_ROUTES = {
  login: "/login",
  logout: "/logout",
  verifyRequest: "/verify-request",
  error: "/auth/error",
} as const;

type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];

// API 路径
const API_PATHS = ["/api"];
// 公开路径
const PUBLIC_PATHS = ["/", "/about", "/privacy", "/terms"];

// 有效的错误类型和它们的来源路径映射
const ERROR_SOURCES = {
  Verification: AUTH_ROUTES.verifyRequest,
  Configuration: "/api", // API 配置错误
  AccessDenied: AUTH_ROUTES.login, // 登录失败
} as const;

type ValidError = keyof typeof ERROR_SOURCES;

/**
 * 检查路径是否匹配前缀列表中的任何一个
 */
function matchesPath(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * 添加安全响应头
 */
function addSecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  // 仅在生产环境启用 CSP
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    );
  }
}

/**
 * 检查路径是否为认证路由
 */
function isAuthRoute(path: string): path is AuthRoute {
  return Object.values(AUTH_ROUTES).includes(path as AuthRoute);
}

/**
 * 中间件主函数
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 获取认证会话
  const [authError, session] = await catchError(auth());
  if (authError) {
    console.error("认证错误:", authError);
    return NextResponse.redirect(
      new URL("/auth/error?error=Configuration", request.url),
    );
  }

  const isAuthenticated = !!session?.user;
  const response = NextResponse.next();

  // 使用 catchError 处理路由逻辑
  const [routeError, routeResponse] = catchError(() => {
    // 1. API 路由处理
    if (matchesPath(pathname, API_PATHS)) {
      if (!isAuthenticated) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      return response;
    }

    // 2. 认证路由特殊处理
    if (isAuthRoute(pathname)) {
      // 已登录用户访问登录页面，重定向到首页
      if (isAuthenticated && pathname === AUTH_ROUTES.login) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // verify-request 页面只能从登录流程访问
      if (pathname === AUTH_ROUTES.verifyRequest) {
        const referer = request.headers.get("referer");
        if (!referer?.includes(AUTH_ROUTES.login)) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      // auth/error 页面访问控制
      if (pathname === AUTH_ROUTES.error) {
        const error = searchParams.get("error") as ValidError | null;
        const referer = request.headers.get("referer");

        // 检查错误类型是否有效
        if (!error || !Object.keys(ERROR_SOURCES).includes(error)) {
          return NextResponse.redirect(new URL("/", request.url));
        }

        // 检查来源路径是否匹配
        const expectedSource = ERROR_SOURCES[error];
        if (!referer?.includes(expectedSource)) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      return response;
    }

    // 3. 需要认证的路径处理
    if (matchesPath(pathname, AUTH_PATHS)) {
      if (!isAuthenticated) {
        const callbackUrl = encodeURIComponent(request.url);
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
        );
      }
      return response;
    }

    // 4. 公开路径处理
    if (matchesPath(pathname, PUBLIC_PATHS)) {
      return response;
    }

    // 5. 静态资源处理
    if (
      /\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.exec(pathname)
    ) {
      return response;
    }

    // 6. 默认处理：允许访问
    return response;
  });

  // 处理路由错误
  if (routeError) {
    console.error("路由处理错误:", routeError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  // 添加安全响应头
  addSecurityHeaders(routeResponse);

  return routeResponse;
}

/**
 * 配置中间件匹配的路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (浏览器图标)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
