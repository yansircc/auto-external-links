/**
 * @description 环境变量验证可以通过 SKIP_ENV_VALIDATION 跳过
 * 这在 Docker 构建时特别有用
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
};

export default config;
