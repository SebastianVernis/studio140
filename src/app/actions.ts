
"use server";

import { generateMarketingPost, type GenerateMarketingPostInput, type GenerateMarketingPostOutput } from "@/ai/flows/generate-marketing-post";
import { generateMarketingImage, type GenerateMarketingImageInput, type GenerateMarketingImageOutput } from "@/ai/flows/generate-marketing-image";

export interface GenerateTextActionResult {
  data?: GenerateMarketingPostOutput;
  error?: string;
}

export async function generateTextAction(input: GenerateMarketingPostInput): Promise<GenerateTextActionResult> {
  try {
    const result = await generateMarketingPost(input);
    return { data: result };
  } catch (error) {
    console.error("Error in generateTextAction:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred while generating text." };
  }
}

export interface GenerateImageActionResult {
  data?: GenerateMarketingImageOutput;
  error?: string;
}

export async function generateImageAction(input: GenerateMarketingImageInput): Promise<GenerateImageActionResult> {
  try {
    const result = await generateMarketingImage(input);
    return { data: result };
  } catch (error) {
    console.error("Error in generateImageAction:", error);
    // Check for specific Genkit error structures if applicable
    let errorMessage = "An unknown error occurred while generating the image.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // It might be useful to log the full error object for more details,
    // especially if it's a Genkit-specific error with more context.
    // console.error("Full error object in generateImageAction:", JSON.stringify(error, null, 2));
    return { error: errorMessage };
  }
}
