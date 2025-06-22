# Studio140 - Vercel Migration Guide

## Overview

This project has been migrated from Firebase/Google Cloud to Vercel with the following changes:

### New AI Workflow
1. **Mistral AI** generates optimized prompts for marketing content
2. **Gemini AI** analyzes prompts and generates images
3. **Dual Generation**: When an existing prompt is detected, both AIs generate independent images

### Removed Dependencies
- Firebase SDK
- Google Cloud dependencies
- Genkit framework
- Firebase App Hosting configuration

### Added Dependencies
- `@mistralai/mistralai`: For prompt generation
- `@google/generative-ai`: For image generation

## Environment Variables

You need to set up the following environment variables:

### Required API Keys
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

#### Mistral AI API Key
1. Go to [Mistral AI Console](https://console.mistral.ai/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your environment variables

#### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and add it to your environment variables

## Local Development

1. Clone the repository and switch to the migration branch:
```bash
git checkout vercel-migration
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

## Vercel Deployment

### Option 1: Vercel CLI
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard or via CLI:
```bash
vercel env add MISTRAL_API_KEY
vercel env add GEMINI_API_KEY
```

### Option 2: Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Import the project
3. Add environment variables in the project settings:
   - `MISTRAL_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy

## New Features

### Dual Image Generation
When the system detects a previously used prompt, it automatically generates two different images:
1. One using the standard Gemini approach
2. One using a Mistral-optimized prompt with Gemini generation

### Enhanced Error Handling
- API key validation before processing
- Graceful fallbacks when AI services are unavailable
- Detailed error messages for debugging

### Optimized for Vercel
- Serverless function configuration
- Optimized webpack bundling
- Proper environment variable handling
- CORS headers for API routes

## File Structure Changes

### Removed Files
- `apphosting.yaml` (Firebase App Hosting)
- `src/ai/genkit.ts` (Genkit configuration)
- `src/ai/dev.ts` (Genkit development)

### New Files
- `src/ai/config.ts` (New AI configuration)
- `vercel.json` (Vercel deployment configuration)
- `README-VERCEL-MIGRATION.md` (This file)

### Modified Files
- `package.json` (Updated dependencies)
- `src/ai/flows/generate-marketing-post.ts` (Mistral integration)
- `src/ai/flows/generate-marketing-image.ts` (New dual generation workflow)
- `src/app/actions.ts` (Updated server actions)
- `next.config.ts` (Vercel optimizations)

## API Usage

The API endpoints remain the same, but now use the new AI providers:

### Text Generation
Uses Mistral AI for generating marketing posts with hashtags.

### Image Generation
Uses a two-step process:
1. Mistral generates an optimized image prompt
2. Gemini generates the image based on the optimized prompt

### Dual Image Generation
Automatically triggered for repeated prompts, generating two variations.

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure both `MISTRAL_API_KEY` and `GEMINI_API_KEY` are set
   - Verify the keys are valid and have sufficient quota

2. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that Node.js version is 18.17.0 or higher

3. **Image Generation Failures**
   - Check Gemini API quota and limits
   - Verify the prompt doesn't violate content policies

4. **Deployment Issues**
   - Ensure environment variables are set in Vercel dashboard
   - Check function timeout limits (set to 60 seconds)

## Performance Considerations

- Image generation may take 30-60 seconds depending on complexity
- Dual image generation takes longer but provides better variety
- Mistral prompt optimization improves image quality
- Vercel edge functions provide global distribution

## Support

For issues related to:
- **Mistral AI**: Check [Mistral Documentation](https://docs.mistral.ai/)
- **Gemini AI**: Check [Google AI Documentation](https://ai.google.dev/)
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
