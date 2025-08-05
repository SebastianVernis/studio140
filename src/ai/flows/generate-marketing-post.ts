'use server';

/**
 * @fileOverview Generates marketing post text and hashtags for a given topic, platform, tone of voice, and language.
 *
 * - generateMarketingPost - A function that handles the marketing post generation process.
 * - GenerateMarketingPostInput - The input type for the generateMarketingPost function.
 * - GenerateMarketingPostOutput - The return type for the generateMarketingPost function.
 */

import { mistralClient, mistralModel } from '@/ai/config';
import { z } from 'zod';

const GenerateMarketingPostInputSchema = z.object({
  topic: z.string().describe('The topic of the marketing post.'),
  platform: z
    .string()
    .describe('The platform for the marketing post (e.g., Instagram, Facebook, Twitter).'),
  tone: z
    .string()
    .describe('The tone of voice for the marketing post (e.g., Professional, Friendly, Funny).'),
  language: z
    .string()
    .describe(
      'The language for the marketing post (e.g., es, en, fr). Provide BCP 47 language codes.'
    ),
});
export type GenerateMarketingPostInput = z.infer<typeof GenerateMarketingPostInputSchema>;

const GenerateMarketingPostOutputSchema = z.object({
  main_text: z.string().describe('The main text of the marketing post.'),
  hashtags: z
    .array(z.string())
    .describe(
      'An array of relevant hashtags for the post. Hashtags should be in the specified language and without the # symbol.'
    ),
});
export type GenerateMarketingPostOutput = z.infer<typeof GenerateMarketingPostOutputSchema>;

export async function generateMarketingPost(
  input: GenerateMarketingPostInput
): Promise<GenerateMarketingPostOutput> {
  const prompt = `You are a social media marketing expert. Generate a marketing post in the specified language.

Target Language: ${input.language}
Topic: ${input.topic}
Platform: ${input.platform}
Tone of voice: ${input.tone}

The post should include a main text and a list of relevant hashtags. The hashtags should also be in the target language and provided as a list of strings without the '#' symbol.

Please respond with a JSON object in the following format:
{
  "main_text": "Your marketing post text here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Post:`;

  try {
    const response = await mistralClient.chat.complete({
      model: mistralModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      responseFormat: {
        type: 'json_object',
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Mistral API');
    }

    // Handle both string and ContentChunk[] types
    const contentText = typeof content === 'string' ? content : String(content);
    const parsedResponse = JSON.parse(contentText);

    // Validate the response structure
    const validatedOutput = GenerateMarketingPostOutputSchema.parse(parsedResponse);

    return validatedOutput;
  } catch (error) {
    console.error('Error generating marketing post with Mistral:', error);
    throw new Error(
      `Failed to generate marketing post: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
