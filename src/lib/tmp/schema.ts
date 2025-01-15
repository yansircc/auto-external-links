import { z } from "zod";

const groupMessageSchema = z.object({
  talker: z.string().describe("The nickname of the talker, beside the avatar"),
  message: z.string().describe("The message of the talker"),
});

export const groupMessagesListSchema = z.object({
  messages: z.array(groupMessageSchema).nullable(),
});

export const answerSchema = z.object({
  answer: z.string().describe("The answer to the question"),
});

export type GroupMessagesList = z.infer<typeof groupMessagesListSchema>;
export type Answer = z.infer<typeof answerSchema>;
