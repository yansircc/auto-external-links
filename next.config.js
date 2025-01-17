/**
 * @description 环境变量验证可以通过 SKIP_ENV_VALIDATION 跳过
 * 这在 Docker 构建时特别有用
 */
import "./src/env.js";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default withNextIntl(nextConfig);
