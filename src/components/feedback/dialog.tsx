import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackForm } from "./form";
import { getTranslations } from "next-intl/server";
import { type FeedbackMessages } from "./messages";

export default async function FeedbackDialog() {
  const t = await getTranslations("feedback");

  // 预先获取所有需要的翻译
  const messages: FeedbackMessages = {
    title: t("title"),
    description: t("description"),
    message: {
      label: t("message.label"),
      placeholder: t("message.placeholder"),
      min: t("message.min"),
      max: t("message.max"),
    },
    email: {
      label: t("email.label"),
      placeholder: t("email.placeholder"),
      invalid: t("email.invalid"),
    },
    submit: t("submit"),
    submitting: t("submitting"),
    errors: {
      submit: t("errors.submit"),
    },
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{messages.title}</DialogTitle>
          <DialogDescription>{messages.description}</DialogDescription>
        </DialogHeader>
        <FeedbackForm messages={messages} />
      </DialogContent>
    </Dialog>
  );
}
