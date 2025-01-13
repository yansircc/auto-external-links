"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { FormData } from "@/app/schema";
import { formSchema } from "@/app/schema";

interface EditorFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

const MAX_CHARS = 2000;

export function EditorForm({ onSubmit, isLoading }: EditorFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const text = form.watch("text");
  const charCount = text?.length ?? 0;

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 p-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <Textarea
          className="min-h-[200px] resize-none bg-background/50 transition-colors focus-visible:bg-background"
          placeholder="请输入要分析的英文文本..."
          {...form.register("text")}
          disabled={isLoading}
        />
        <motion.div
          className="flex justify-between text-sm text-muted-foreground"
          layout
        >
          <span>{form.formState.errors.text?.message}</span>
          <span>
            {charCount}/{MAX_CHARS}
          </span>
        </motion.div>
      </div>

      <motion.div className="flex justify-end" layout>
        <Button
          type="submit"
          disabled={isLoading}
          className="shadow-sm transition-all hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              分析关键词
            </>
          ) : (
            "分析关键词"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}
