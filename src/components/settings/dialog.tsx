import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { BlacklistManager } from "./blacklist-manager";
import { PreferredSitesManager } from "./preferred-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">设置</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>搜索设置</DialogTitle>
          <DialogDescription>管理搜索偏好和过滤规则</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preferred">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preferred">偏好网站</TabsTrigger>
            <TabsTrigger value="blacklist">黑名单</TabsTrigger>
          </TabsList>
          <TabsContent value="preferred">
            <PreferredSitesManager />
          </TabsContent>
          <TabsContent value="blacklist">
            <BlacklistManager />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
