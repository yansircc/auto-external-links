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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  message: z
    .string()
    .min(10, "反馈内容至少需要 10 个字符")
    .max(1000, "反馈内容不能超过 1000 个字符"),
});

type FormData = z.infer<typeof formSchema>;

export function FeedbackForm() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: FormData) {
    const formDataUrl = process.env.NEXT_PUBLIC_FORM_DATA_URL;
    if (!formDataUrl) {
      form.setError("message", {
        type: "manual",
        message: "系统配置错误，请联系管理员",
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
        throw new Error("提交失败");
      }

      // 提交成功后跳转到感谢页
      router.push("/thanks");
    } catch (error) {
      console.error("提交反馈时出错:", error);
      form.setError("message", {
        type: "manual",
        message: "提交失败，请稍后重试",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>反馈内容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="请描述您遇到的问题或建议..."
                  className="min-h-[160px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              提交中...
            </>
          ) : (
            "提交反馈"
          )}
        </Button>
      </form>
    </Form>
  );
}
