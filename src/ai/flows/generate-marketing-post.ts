
'use server';

/**
 * @fileOverview Generates marketing post text and hashtags for a given topic, platform, tone of voice, and language.
 *
 * - generateMarketingPost - A function that handles the marketing post generation process.
 * - GenerateMarketingPostInput - The input type for the generateMarketingPost function.
 * - GenerateMarketingPostOutput - The return type for the generateMarketingPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketingPostInputSchema = z.object({
  topic: z.string().describe('The topic of the marketing post.'),
  platform: z.string().describe('The platform for the marketing post (e.g., Instagram, Facebook, Twitter).'),
  tone: z.string().describe('The tone of voice for the marketing post (e.g., Professional, Friendly, Funny).'),
  language: z.string().describe('The language for the marketing post (e.g., es, en, fr). Provide BCP 47 language codes.'),
});
export type GenerateMarketingPostInput = z.infer<typeof GenerateMarketingPostInputSchema>;

const GenerateMarketingPostOutputSchema = z.object({
  main_text: z.string().describe('The main text of the marketing post.'),
  hashtags: z.array(z.string()).describe('An array of relevant hashtags for the post. Hashtags should be in the specified language and without the # symbol.'),
});
export type GenerateMarketingPostOutput = z.infer<typeof GenerateMarketingPostOutputSchema>;

export async function generateMarketingPost(input: GenerateMarketingPostInput): Promise<GenerateMarketingPostOutput> {
  return generateMarketingPostFlow(input);
}

const generateMarketingPostPrompt = ai.definePrompt({
  name: 'generateMarketingPostPrompt',
  input: {schema: GenerateMarketingPostInputSchema},
  output: {schema: GenerateMarketingPostOutputSchema},
  prompt: `You are a social media marketing expert. Generate a marketing post in the specified language.

Target Language: {{{language}}}
Topic: {{{topic}}}
Platform: {{{platform}}}
Tone of voice: {{{tone}}}

The post should include a main text and a list of relevant hashtags. The hashtags should also be in the target language and provided as a list of strings without the '#' symbol.

Post:
`,
});

const generateMarketingPostFlow = ai.defineFlow(
  {
    name: 'generateMarketingPostFlow',
    inputSchema: GenerateMarketingPostInputSchema,
    outputSchema: GenerateMarketingPostOutputSchema,
  },
  async input => {
    const {output} = await generateMarketingPostPrompt(input);
    return output!;
  }
);

    