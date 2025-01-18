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
import { getSettingsMessages } from "./messages";

export default async function SettingsDialog() {
  const messages = await getSettingsMessages();

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
