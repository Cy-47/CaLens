import { createWorker, type Worker } from "tesseract.js";
// import sharp from "sharp";
import { OpenAI } from "openai";
import { uint8ArrayToBase64 } from "uint8array-extras";

class Preprocessor {
  initialized: Promise<void>;
  ocrWorker!: Worker;
  openai: OpenAI;

  constructor(openai_key?: string) {
    console.log("initializing with api key", openai_key);
    this.initialized = this.init();
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

  async init() {
    // this.ocrWorker = await createWorker("eng");
  }

  async ocr(
    image:
      | Buffer
      | ArrayBuffer
      | Uint8Array
      | Uint8ClampedArray
      | Int8Array
      | Uint16Array
      | Int16Array
      | Uint32Array
      | Int32Array
      | Float32Array
      | Float64Array
      | string
  ) {
    await this.initialized;
    // let sp = sharp(image);

    // const ret = await this.ocrWorker.recognize(await sp.toBuffer());
    // return ret.data.text;
  }

  async extractEvent(image: Uint8Array): Promise<any> {
    let image_url = "data:image/jpeg;base64," + uint8ArrayToBase64(image);
    const now = new Date();
    const response = await this.openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
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
      ],
      temperature: 0.3,
      max_tokens: 200,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "calendar_event",
          schema: {
            type: "object",
            required: ["title", "start", "description"],
            properties: {
              end: {
                type: "string",
                description: "The end time of the event in ISO 8601 format.",
              },
              start: {
                type: "string",
                description: "The start time of the event in ISO 8601 format.",
              },
              title: {
                type: "string",
                description: "The title of the calendar event.",
              },
              allDay: {
                type: "boolean",
                description: "Whether the event is all day.",
              },
              location: {
                type: "string",
                description: "The location where the event will take place.",
              },
              description: {
                type: "string",
                description: "A brief description of the event.",
              },
            },
            additionalProperties: false,
          },
          strict: false,
        },
      },
    });
    console.log(
      "OpenAI response",
      typeof response.choices[0].message.parsed,
      response.choices[0].message.parsed
    );
    return response.choices[0].message.parsed;
  }
}

export { Preprocessor };
