"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormData } from "@/app/schema";
import { useState } from "react";

interface EditorFormProps {
  text: string;
  isLoading: boolean;
  onSubmit: (data: FormData) => Promise<void>;
}

const MAX_CHARS = 2000;

export function EditorForm({ text, isLoading, onSubmit }: EditorFormProps) {
  const [charCount, setCharCount] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text,
    },
  });

  // 处理文本变化
  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setCharCount(text.length);
    // 如果超出字符限制，截断文本
    if (text.length > MAX_CHARS) {
      e.target.value = text.slice(0, MAX_CHARS);
      return;
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">输入文本</span>
          <span
            className={`text-sm ${
              charCount > MAX_CHARS
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {charCount} / {MAX_CHARS}
          </span>
        </div>
        <Textarea
          {...form.register("text")}
          placeholder="请输入要分析的英文文本..."
          className="min-h-[200px]"
          disabled={isLoading}
          onChange={(e) => {
            handleTextChange(e);
            void form.register("text").onChange(e);
          }}
        />
        {form.formState.errors.text && (
          <p className="text-sm text-destructive">
            {form.formState.errors.text.message}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || charCount > MAX_CHARS}
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              分析中...
            </>
          ) : (
            "分析关键词"
          )}
        </Button>
      </div>
    </form>
  );
}
