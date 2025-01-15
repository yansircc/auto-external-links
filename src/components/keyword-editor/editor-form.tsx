"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { type FormData, formSchema } from "./core/schema";
import { EditorLayout, EditorActions } from "./core/editor-layout";
import { MAX_LENGTH } from "./core/config";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface EditorFormProps {
  text: string;
  isLoading: boolean;
  onSubmit: (data: FormData) => Promise<void>;
}

export function EditorForm({ text, isLoading, onSubmit }: EditorFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text,
    },
  });

  const t = useTranslations('keyword-editor.form');

  const count = form.watch("text")?.length ?? 0;
  const isOverLimit = count > MAX_LENGTH;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-1 flex-col"
    >
      <EditorLayout>
        <div className="flex-1">
          <Textarea
            placeholder={t('placeholder')}
            className="min-h-[160px] resize-none bg-transparent"
            {...form.register("text")}
            maxLength={MAX_LENGTH}
          />
          <div className="mt-4 flex items-center justify-between text-sm">
            <div
              className={cn(
                "tabular-nums",
                isOverLimit ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {t('characterCount', { count, max: MAX_LENGTH })}
            </div>
            <EditorActions>
              <Button type="submit" disabled={isLoading || isOverLimit}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('analyzing')}
                  </>
                ) : (
                  t('analyze')
                )}
              </Button>
            </EditorActions>
          </div>
        </div>
      </EditorLayout>
    </form>
  );
}
