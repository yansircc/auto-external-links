"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { type FormData, formSchema } from "./core/schema";
import { EditorLayout, EditorActions } from "./core/editor-layout";
import { MAX_LENGTH } from "./core/config";
import { cn } from "@/lib/utils";
import { type EditorMessages } from "./core/messages";
import { useKeywordEditorStore } from "@/stores/keyword-editor";

interface EditorFormProps {
  messages: EditorMessages["form"];
  onSubmit: (data: FormData) => Promise<void>;
}

export function EditorForm({ messages, onSubmit }: EditorFormProps) {
  const { text, isLoading } = useKeywordEditorStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text,
    },
  });

  const count = form.watch("text")?.length ?? 0;
  const isOverLimit = count > MAX_LENGTH;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col"
      >
        <EditorLayout>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={messages.placeholder}
                      className="min-h-[160px] resize-none bg-transparent"
                      maxLength={MAX_LENGTH}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div
                className={cn(
                  "tabular-nums",
                  isOverLimit ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {count} / {MAX_LENGTH}
              </div>
              <EditorActions>
                <Button type="submit" disabled={isLoading || isOverLimit}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {messages.analyzing}
                    </>
                  ) : (
                    messages.analyze
                  )}
                </Button>
              </EditorActions>
            </div>
          </div>
        </EditorLayout>
      </form>
    </Form>
  );
}
