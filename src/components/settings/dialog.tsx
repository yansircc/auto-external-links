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
import { getTranslations } from "next-intl/server";
import { type SettingsMessages } from "./messages";

export default async function SettingsDialog() {
  const dialogT = await getTranslations("settings.dialog");
  const blacklistT = await getTranslations("settings.blacklist");
  const preferredT = await getTranslations("settings.preferred");

  const messages: SettingsMessages = {
    dialog: {
      title: dialogT("title"),
      searchTitle: dialogT("searchTitle"),
      searchDescription: dialogT("searchDescription"),
      preferredTitle: dialogT("preferredTitle"),
      blacklistTitle: dialogT("blacklistTitle"),
    },
    blacklist: {
      input: {
        placeholder: blacklistT("input.placeholder"),
        add: blacklistT("input.add"),
      },
      list: {
        remove: blacklistT("list.remove"),
        empty: blacklistT("list.empty"),
      },
    },
    preferred: {
      input: {
        placeholder: preferredT("input.placeholder"),
        add: preferredT("input.add"),
      },
      list: {
        remove: preferredT("list.remove"),
        empty: preferredT("list.empty"),
      },
      maxLimit: preferredT("maxLimit"),
      message: preferredT("message"),
    },
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">{messages.dialog.title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{messages.dialog.searchTitle}</DialogTitle>
          <DialogDescription>
            {messages.dialog.searchDescription}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preferred">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preferred">
              {messages.dialog.preferredTitle}
            </TabsTrigger>
            <TabsTrigger value="blacklist">
              {messages.dialog.blacklistTitle}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preferred">
            <PreferredSitesManager messages={messages.preferred} />
          </TabsContent>
          <TabsContent value="blacklist">
            <BlacklistManager messages={messages.blacklist} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
