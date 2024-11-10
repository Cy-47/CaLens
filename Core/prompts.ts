import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import z from "zod";

export function extractMsg(image_url: string): ChatCompletionMessageParam[] {
  const now = new Date();
  return [
    {
      role: "system",
      content: [
        {
          text: `You are part of a software that extracts events from images and add them to the user's calendar. You will be provided with images showing events. Your task is to extract the event information from them.\n The current time is ${now.toString()}. Provide output in JSON format.`,
          type: "text",
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Extract events from this image:",
        },
        {
          type: "image_url",
          image_url: {
            url: image_url,
            detail: "auto",
          },
        },
      ],
    },
  ];
}

export const msgGenerators = {
  extractMsg: extractMsg,
};
