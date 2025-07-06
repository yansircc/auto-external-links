"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { sendFeedback } from "@/actions/feedback";
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
import { catchError } from "@/utils";
import type { FeedbackMessages } from "./messages";

interface FeedbackFormProps {
	messages: FeedbackMessages;
}

export function FeedbackForm({ messages }: FeedbackFormProps) {
	const router = useRouter();

	const formSchema = z.object({
		message: z
			.string()
			.min(10, messages.message.min)
			.max(1000, messages.message.max),
		email: z
			.string()
			.email(messages.email.invalid)
			.optional()
			.or(z.literal("")),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			message: "",
			email: "",
		},
	});

	const isSubmitting = form.formState.isSubmitting;

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const [error] = await catchError(sendFeedback(data));

		if (error) {
			console.error("提交反馈时出错:", error);
			form.setError("message", {
				type: "manual",
				message: messages.errors.submit,
			});
			return;
		}

		router.push("/thanks");
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="message"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{messages.message.label}</FormLabel>
							<FormControl>
								<Textarea
									placeholder={messages.message.placeholder}
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
							<FormLabel>{messages.email.label}</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder={messages.email.placeholder}
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
							{messages.submitting}
						</>
					) : (
						messages.submit
					)}
				</Button>
			</form>
		</Form>
	);
}
