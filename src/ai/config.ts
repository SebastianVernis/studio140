import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mistral } from '@mistralai/mistralai';

// Validate environment variables
if (!process.env.MISTRAL_API_KEY) {
  throw new Error('MISTRAL_API_KEY environment variable is required');
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize Mistral client for prompt generation
export const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// Initialize Google Generative AI client for image generation
export const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get Gemini model for image generation
export const geminiImageModel = geminiClient.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp' 
});

// Get Mistral model for text generation
export const mistralModel = 'mistral-large-latest';
