
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
  prompt: `Generate an illustrative and visually appealing marketing image that complements the topic: {{{topic}}}. The image should act as a visual accompaniment to a text post on this topic, enhancing its message rather than literally depicting it. Aim for a high-quality, photorealistic style suitable for social media. Return the image as a data URI.`,
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
      prompt: `Generate an illustrative and visually appealing marketing image that complements the topic: ${input.topic}. The image should act as a visual accompaniment to a text post on this topic, enhancing its message rather than literally depicting it. Aim for a high-quality, photorealistic style suitable for social media.`,      
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {imageUrl: media.url!};
  }
);
