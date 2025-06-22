
"use server";

import { generateMarketingPost, type GenerateMarketingPostInput, type GenerateMarketingPostOutput } from "@/ai/flows/generate-marketing-post";
import { generateMarketingImage, generateDualMarketingImages, type GenerateMarketingImageInput, type GenerateMarketingImageOutput } from "@/ai/flows/generate-marketing-image";

export interface GenerateTextActionResult {
  data?: GenerateMarketingPostOutput;
  error?: string;
}

export async function generateTextAction(input: GenerateMarketingPostInput): Promise<GenerateTextActionResult> {
  try {
    // Validate API keys before processing
    if (!process.env.MISTRAL_API_KEY) {
      return { error: "Mistral API key is not configured. Please add MISTRAL_API_KEY to your environment variables." };
    }

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
    // Validate API keys before processing
    if (!process.env.MISTRAL_API_KEY) {
      return { error: "Mistral API key is not configured. Please add MISTRAL_API_KEY to your environment variables." };
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return { error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables." };
    }

    const result = await generateMarketingImage(input);
    return { data: result };
  } catch (error) {
    console.error("Error in generateImageAction:", error);
    let errorMessage = "An unknown error occurred while generating the image.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}

export interface GenerateDualImageActionResult {
  data?: GenerateMarketingImageOutput;
  error?: string;
}

export async function generateDualImageAction(input: GenerateMarketingImageInput): Promise<GenerateDualImageActionResult> {
  try {
    // Validate API keys before processing
    if (!process.env.MISTRAL_API_KEY) {
      return { error: "Mistral API key is not configured. Please add MISTRAL_API_KEY to your environment variables." };
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return { error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables." };
    }

    const result = await generateDualMarketingImages(input);
    return { data: result };
  } catch (error) {
    console.error("Error in generateDualImageAction:", error);
    let errorMessage = "An unknown error occurred while generating dual images.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}
