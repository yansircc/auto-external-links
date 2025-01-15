import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { compressAndConvertToBase64 } from "./images";
import { groupMessagesListSchema, answerSchema } from "./schema";

async function main() {
  try {
    const openai = createOpenAI({
      apiKey:
        "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",
    });
    const deepseek = createDeepSeek({
      apiKey: "sk-d0cae9435e7444139afe27620ecba6cf",
    });
    const fixedScreenshotPath = "/Users/yansir/Desktop/imgs/screenshot.png";
    const image = await compressAndConvertToBase64(fixedScreenshotPath, {
      width: 800,
      quality: 75,
    });

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: groupMessagesListSchema,
      system:
        "You're a helpful assistant that can extract question messages from group chat messages. Please carefully analyze each message in the image, identify all messages with question intent. Only return messages that actually contain question intent, ignore other normal conversation content. Note that you can return an empty array if there are no question messages in the image.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image,
            },
          ],
        },
      ],
    });

    if (!object.messages) {
      console.log("没有找到问题");
      return;
    }

    const answers = [];

    for (const message of object.messages) {
      const { object: answer } = await generateObject({
        model: deepseek("deepseek-chat"),
        schema: answerSchema,
        messages: [{ role: "user", content: message.message }],
      });
      answers.push(answer.answer);
    }

    console.log(JSON.stringify(answers, null, 2));
  } catch (error) {
    console.error("错误：", error);
    process.exit(1);
  }
}

void main();
