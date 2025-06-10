'use server';

/**
 * @fileOverview Image generation flow for creating marketing images based on a given topic.
 *
 * - generateMarketingImage - Generates a marketing image.
 * - GenerateMarketingImageInput - Input type for the function.
 * - GenerateMarketingImageOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketingImageInputSchema = z.object({
  topic: z.string().describe('The topic or subject for the marketing image.'),
});

export type GenerateMarketingImageInput = z.infer<typeof GenerateMarketingImageInputSchema>;

const GenerateMarketingImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'The generated marketing image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'  
    ),
});

export type GenerateMarketingImageOutput = z.infer<typeof GenerateMarketingImageOutputSchema>;

export async function generateMarketingImage(
  input: GenerateMarketingImageInput
): Promise<GenerateMarketingImageOutput> {
  return generateMarketingImageFlow(input);
}

const generateMarketingImagePrompt = ai.definePrompt({
  name: 'generateMarketingImagePrompt',
  input: {schema: GenerateMarketingImageInputSchema},
  output: {schema: GenerateMarketingImageOutputSchema},
  prompt: `Generate a marketing image for the topic: {{{topic}}}.  The image should be high quality and photorealistic, suitable for use in social media marketing. Return the image as a data URI.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const generateMarketingImageFlow = ai.defineFlow(
  {
    name: 'generateMarketingImageFlow',
    inputSchema: GenerateMarketingImageInputSchema,
    outputSchema: GenerateMarketingImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate a marketing image for the topic: ${input.topic}. The image should be high quality and photorealistic, suitable for use in social media marketing.`,      
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {imageUrl: media.url!};
  }
);
