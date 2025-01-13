"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { type FormData, formSchema } from "@/app/schema";
import { EditorLayout, EditorActions } from "./editor-layout";
import { cn } from "@/lib/utils";

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

  const count = form.watch("text")?.length ?? 0;
  const isOverLimit = count > 2000;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-1 flex-col"
    >
      <EditorLayout>
        <div className="flex-1">
          <Textarea
            placeholder="请输入要分析的英文文本..."
            className="min-h-[160px] resize-none bg-transparent"
            {...form.register("text")}
          />
          <div className="mt-4 flex items-center justify-between text-sm">
            <div
              className={cn(
                "tabular-nums",
                isOverLimit ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {count} / 2000
            </div>
            <EditorActions>
              <Button type="submit" disabled={isLoading || isOverLimit}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  "分析关键词"
                )}
              </Button>
            </EditorActions>
          </div>
        </div>
      </EditorLayout>
    </form>
  );
}
