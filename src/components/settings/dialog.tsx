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
import { useTranslations } from "next-intl";

export default function SettingsDialog() {
  const t = useTranslations("settings.dialog");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">{t("title")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("searchTitle")}</DialogTitle>
          <DialogDescription>{t("searchDescription")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preferred">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preferred">{t("preferredTitle")}</TabsTrigger>
            <TabsTrigger value="blacklist">{t("blacklistTitle")}</TabsTrigger>
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
