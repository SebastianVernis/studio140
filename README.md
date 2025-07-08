# CHISPART Marketing

CHISPART Marketing is a Next.js application that leverages Artificial Intelligence to generate engaging marketing content, including text and images, tailored for various social media platforms.

## Features

- **AI-Powered Text Generation:** Create compelling marketing copy based on your topic, target platform, desired tone of voice, and language.
- **AI-Powered Image Generation:** Design unique marketing visuals from a text prompt, with options for specific platforms, image types, and the ability to refine an uploaded base image.
- **Multi-Platform Support:** Generate content optimized for Instagram, Facebook, Twitter (X), LinkedIn, TikTok, or use generic formats.
- **Tone Customization:** Choose from a variety of tones (e.g., Profesional, Amistoso, Divertido) to match your brand's voice.
- **Language Options:** Generate text in multiple languages, including Spanish, English, Chinese, Hindi, Arabic, and French.
- **Platform-Specific Image Formats:** Select from a wide range of image dimensions and aspect ratios suitable for different social media placements (e.g., Instagram Story, Facebook Post, Twitter Header).
- **Dual Image Generation:** For previously used or refined prompts, the system can generate two distinct image options, offering more creative choices.
- **Base Image Upload:** Provide your own image as a starting point for the AI to modify or enhance.

## Technologies Used

- **Framework:** Next.js (v14+)
- **Language:** TypeScript
- **UI:** React, Shadcn/ui, Tailwind CSS
- **AI Models:**
    - **Mistral AI:** Used for generating marketing text and optimizing image prompts.
    - **Google Gemini:** Used for generating marketing images.
- **State Management:** React Hooks (`useState`, `useEffect`)
- **Linting/Formatting:** ESLint, Prettier

## How to Use

The application provides a user-friendly interface divided into two main sections:

### 1. Generate Marketing Text & Image Plan

This section helps you create marketing text and define the parameters for an accompanying image.

1.  **Tema o Producto Principal:** Enter the core subject of your marketing content (e.g., "Zapatillas cyber-punk autoajustables").
2.  **Plataforma:** Select the social media platform where the content will be used. This influences text style and available image formats.
3.  **Tono de Voz:** Choose the desired tone for your marketing message.
4.  **Idioma:** Select the language for the generated text.
5.  **Formato de Imagen:** Pick an image format that corresponds to your selected platform and intended use.
6.  Click **"Generar Texto y Plan de Imagen"**.
    *   The generated text (main copy and hashtags) and the image plan will appear in the "Resultados Generados" section.
    *   From there, you can trigger the image generation for that specific post.

### 2. Generate Image from Prompt

This section allows for direct image generation based on your creative brief.

1.  **Imagen Base (Opcional):** You can upload an existing image that the AI will use as a reference or starting point.
2.  **Tu Prompt Detallado para la Imagen:** Write a detailed description of the image you want to create (e.g., "Un holograma brillante de un fénix resurgiendo de datos binarios, ciudad cyberpunk de fondo, lluvia de neón.").
3.  **Plataforma:** Select the relevant social media platform.
4.  **Formato de Imagen:** Choose the desired dimensions and aspect ratio for your image.
5.  Click **"Generar Solo Imagen"**.
    *   The generated image will appear in the "Resultados Generados" section.

### Resultados Generados

All generated text and images are displayed as content cards in this area. Each card allows for actions like:
*   Generating an image if only text was created.
*   Regenerating text for an existing post.
*   Viewing generated images.

## Project Structure

A brief overview of the key directories and files:

-   `src/app/page.tsx`: The main page component containing the UI and core application logic.
-   `src/ai/flows/`: Contains the server-side logic for interacting with AI models.
    -   `generate-marketing-post.ts`: Handles the generation of marketing text and hashtags using Mistral AI.
    -   `generate-marketing-image.ts`: Manages the image generation process, including prompt optimization with Mistral AI and image creation with Google Gemini.
-   `src/components/`: Contains reusable React components used throughout the application (e.g., `content-card.tsx`, UI elements from `shadcn/ui`).
-   `src/hooks/`: Custom React hooks (e.g., `useToast.ts`).
-   `src/lib/`: Utility functions.
-   `public/`: Static assets like favicons.
-   `package.json`: Lists project dependencies and scripts.
-   `next.config.js`: Configuration for the Next.js application.
-   `tailwind.config.ts`: Configuration for Tailwind CSS.

## Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Set up environment variables:**
    You will need API keys for Mistral AI and Google Gemini. Create a `.env.local` file in the root of the project and add your keys:
    ```env
    MISTRAL_API_KEY=your_mistral_api_key
    GEMINI_API_KEY=your_gemini_api_key
    # Potentially other Firebase related environment variables if using Firebase features beyond Studio
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

This README provides an overview of the CHISPART Marketing application, its features, and how to get it running.
