import { signOut } from "@/server/auth";
import { Button } from "@/components/ui/button";

export default async function Page() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit">退出登录</Button>
    </form>
  );
}
