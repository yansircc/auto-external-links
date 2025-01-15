"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormDataBadge } from "./form-data-badge";
import { isEqual } from 'lodash';

export function FeedbackForm() {
  const router = useRouter();
  const t = useTranslations('feedback.form');

  const formSchema = z.object({
    message: z
      .string()
      .min(10)
      .max(1000),
    email: z.string().email().optional().or(z.literal("")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema, {
      errorMap: (issue, ctx) => {
        let message: string | undefined;

        if (isEqual(issue.path, ['message'])) {
          if (issue.code === 'too_small') {
            message = t('message.min');
          } else if (issue.code === 'too_big') {
            message = t('message.max');
          }
        } else if (isEqual(issue.path, ['email'])) {
          if (issue.code === 'invalid_string') {
            message = t('email.invalid');
          }
        }

        return { message: message ?? ctx.defaultError };
      }
    }),
    defaultValues: {
      message: "",
      email: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const formDataUrl = process.env.NEXT_PUBLIC_FORM_DATA_URL;
    if (!formDataUrl) {
      form.setError("message", {
        type: "manual",
        message: t('errors.config'),
      });
      return;
    }

    try {
      const response = await fetch(formDataUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      router.push("/thanks");
    } catch (error) {
      console.error("提交反馈时出错:", error);
      form.setError("message", {
        type: "manual",
        message: t('errors.submit'),
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('message.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('message.placeholder')}
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.label')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('email.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            t('submit')
          )}
        </Button>

        <FormDataBadge />
      </form>
    </Form>
  );
}
