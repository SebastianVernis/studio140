
'use server';

/**
 * @fileOverview Image generation flow for creating marketing images based on a given topic, platform, image type, and an optional base image.
 *
 * - generateMarketingImage - Generates a marketing image.
 * - GenerateMarketingImageInput - Input type for the function.
 * - GenerateMarketingImageOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketingImageInputSchema = z.object({
  topic: z.string().describe('The topic or subject for the marketing image.'),
  platform: z.string().optional().describe('The target social media platform (e.g., Instagram, Facebook). This helps guide the overall style.'),
  imageType: z.string().optional().describe('The type of image to generate, including dimension hints (e.g., "Instagram Story (1080x1920px)", "Facebook Square Post (1200x1200px)"). This helps guide the style and aspect ratio.'),
  baseImageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional base image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. If provided, the generated image will be influenced by this base image."
    ),
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

const generateMarketingImageFlow = ai.defineFlow(
  {
    name: 'generateMarketingImageFlow',
    inputSchema: GenerateMarketingImageInputSchema,
    outputSchema: GenerateMarketingImageOutputSchema,
  },
  async (input) => {
    let textPrompt = `Generate an illustrative and visually appealing marketing image that complements the topic: "${input.topic}".`;
    if (input.platform && input.imageType) {
      textPrompt += ` The image should be suitable for ${input.platform} as a ${input.imageType}.`;
    } else if (input.platform) {
      textPrompt += ` The image should be suitable for ${input.platform}.`;
    } else if (input.imageType) {
      textPrompt += ` The image should be a ${input.imageType}.`;
    }
    textPrompt += ` The image should act as a visual accompaniment to a text post on this topic, enhancing its message rather than literally depicting it. Aim for a high-quality, photorealistic style suitable for social media.`;

    const promptSegments: any[] = [];

    if (input.baseImageDataUri) {
      promptSegments.push({media: {url: input.baseImageDataUri}});
      textPrompt = `Using the provided image as a strong reference or base, ${textPrompt.charAt(0).toLowerCase() + textPrompt.slice(1)}`;
    }
    
    promptSegments.push({text: textPrompt});

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: promptSegments,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
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

    return {imageUrl: media.url!};
  }
);
