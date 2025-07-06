import { auth } from "@/server/auth";
import { catchError } from "@/utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 需要认证的路径
const AUTH_PATHS = ["/dashboard", "/settings", "/api/user"];

// 公开路径
const PUBLIC_PATHS = ["/", "/about", "/privacy", "/terms"];

// NextAuth 的路径和错误类型映射
const NEXTAUTH_PATHS = {
	api: "/api/auth", // NextAuth API 路由
	login: "/login", // 登录页面
	logout: "/logout", // 登出页面
	verifyRequest: "/verify-request", // 验证请求页面
	error: "/auth/error", // 错误页面
} as const;

// 有效的错误类型和它们的来源路径映射
const ERROR_SOURCES = {
	Verification: NEXTAUTH_PATHS.verifyRequest,
	Configuration: NEXTAUTH_PATHS.api,
	AccessDenied: NEXTAUTH_PATHS.login,
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
 * 中间件主函数
 */
export async function middleware(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl;

	// 1. 静态资源直接放行
	if (
		/\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.exec(pathname)
	) {
		return NextResponse.next();
	}

	// 2. 获取认证会话
	const [authError, session] = await catchError(auth());
	if (authError) {
		console.error("认证错误:", authError);
		return NextResponse.redirect(
			new URL("/auth/error?error=Configuration", request.url),
		);
	}

	const isAuthenticated =
		!!session && typeof session === "object" && "user" in session;

	// 3. 处理认证相关路径
	if (pathname.startsWith(NEXTAUTH_PATHS.api)) {
		return NextResponse.next(); // API 路由直接放行
	}

	// 4. 处理错误页面
	if (pathname === NEXTAUTH_PATHS.error) {
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

	// 5. 已登录用户的特殊处理
	if (isAuthenticated) {
		// 已登录用户不能访问登录相关页面
		if (
			pathname === NEXTAUTH_PATHS.login ||
			pathname === NEXTAUTH_PATHS.verifyRequest
		) {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	// 6. 处理需要认证的路径
	if (matchesPath(pathname, AUTH_PATHS)) {
		if (!isAuthenticated) {
			const callbackUrl = encodeURIComponent(request.url);
			return NextResponse.redirect(
				new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
			);
		}
	}

	// 7. 公开路径直接放行
	if (matchesPath(pathname, PUBLIC_PATHS)) {
		return NextResponse.next();
	}

	// 8. 添加安全响应头并返回
	const response = NextResponse.next();
	addSecurityHeaders(response);
	return response;
}

/**
 * 配置中间件匹配的路径
 */
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// 使用 Edge Runtime
export const runtime = "edge";
