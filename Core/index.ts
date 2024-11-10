// import { createWorker, type Worker } from "tesseract.js";
// import sharp from "sharp";
import { uint8ArrayToBase64 } from "uint8array-extras";
import AICaller from "./aiCaller";

class Preprocessor {
  // private initialized: Promise<void>;
  // private ocrWorker!: Worker;

  constructor(openai_key?: string) {
    console.log("initializing with api key", openai_key);
    // this.initialized = this.init();
  }

  // async init() {
  // this.ocrWorker = await createWorker("eng");
  // }
}

export class ExtractionPipeline {
  // private preprocessor: Preprocessor;
  private aiCaller: AICaller;

  constructor(openai_key?: string) {
    // this.preprocessor = new Preprocessor(openai_key);
    this.aiCaller = new AICaller(openai_key);
  }

  async processImage(image: Uint8Array): Promise<any> {
    try {
      let image_url = "data:image/jpeg;base64," + uint8ArrayToBase64(image);
      const aiResult = await this.aiCaller.extractEvents(image_url);
      return aiResult;
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  }
}
