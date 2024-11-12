import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export function extractMsg(image_url: string): ChatCompletionMessageParam[] {
  const now = new Date();
  return [
    {
      role: "system",
      content: [
        {
          text:
            `You will be provided with images showing events. ` +
            `Your task is to first determin whether the given image contain at least one event, and then extract the information about all of the events (if there is any).\n` +
            `If an activity contains multiple dates or time that cannot be stored in a single event, output them as separate events and use a common title prefix to show their relation. ` +
            `Provide output in JSON format.\n` +
            `The current time is ${now.toString()}.`,
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
