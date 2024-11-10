import { OpenAI } from "openai";
import { extractMsg } from "./prompts";
import { zodResponseFormat } from "openai/helpers/zod";
import { eventListSchema } from "./event";

class AICaller {
  openai: OpenAI;
  model: string = "gpt-4o";

  constructor(openai_key?: string) {
    console.log("initializing with api key", openai_key);
    try {
      this.openai = new OpenAI({
        dangerouslyAllowBrowser: true,
        apiKey: openai_key,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        throw new Error("Failed to initialize OpenAI: " + error.message);
      } else {
        throw new Error("Failed to initialize OpenAI: Unknown error");
      }
    }
  }

  async extractEvents(image_url: string): Promise<any> {
    const response = await this.openai.beta.chat.completions.parse({
      model: this.model,
      messages: extractMsg(image_url),
      temperature: 0.3,
      max_tokens: 800,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: zodResponseFormat(eventListSchema, "eventList"),
    });

    console.log(
      "OpenAI response",
      typeof response.choices[0].message.parsed,
      response.choices[0].message.parsed
    );

    if (!response.choices[0].message.parsed) {
      throw new Error("Failed to extract events from image");
    }

    return response.choices[0].message.parsed.events;
  }
}

export default AICaller;
