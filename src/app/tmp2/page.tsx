import { auth } from "@/server/auth";

export default async function Page() {
  const session = await auth();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">个人信息</h1>
      <div className="space-y-2">
        <p>状态：{session?.user ? "已登录" : "未登录"}</p>
        <p>邮箱：{session?.user?.email}</p>
        <p>ID：{session?.user?.id}</p>
        <p>名称：{session?.user?.name ?? "未设置"}</p>
      </div>
    </div>
  );
}
