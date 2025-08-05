<p align="center">
  <img src="assets/Banner.png"  max-width="300">
</p>

# 🚀 CHISPART Marketing

<div class= align-flex>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38b2ac?logo=tailwindcss)](https://tailwindcss.com/) [![Mistral AI](https://img.shields.io/badge/Mistral-AI-orange?logo=ai)](https://mistral.ai/) [![Google Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google)](https://deepmind.google/technologies/gemini/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

> **AI-powered marketing content generator for social media – Create texts and images with Mistral AI + Google Gemini**

---

## ✨ Features

- 📝 **AI Text Generation** – Create marketing copy tailored to platform, tone, and language.  
- 🎨 **AI Image Creation** – Generate unique visuals from text prompts or refine existing images.  
- 📱 **Multi-Platform** – Instagram, TikTok, LinkedIn, Facebook, X, and more.  
- 🌍 **Multilingual Support** – Supports Spanish, English, Chinese, Hindi, Arabic, French, etc.  
- 🎭 **Customizable Tone** – Match your brand voice.  
- 🖼️ **Platform-Specific Image Formats** – Ready-to-use for stories, posts, and headers.  
- 🎯 **Dual Image Generation** – Get two variations for refined prompts.  

---

## 🧩 Flow Diagram

```mermaid
flowchart TD
    A[User enters topic/prompt] --> B[Select platform, tone, language]
    B --> C[Text Generation with Mistral AI]
    B --> D[Prompt Optimization for Image]
    D --> E[Image Generation with Google Gemini]
    C --> F[Render Results]
    E --> F[Render Results]
    F --> G[Actions: Regenerate, Download, Share]
```
    
## 🗂️ Project Structure

```
bash

src/
 ├─ app/page.tsx             # Main UI and logic
 ├─ ai/flows/                # AI integration logic
 │   ├─ generate-marketing-post.ts
 │   └─ generate-marketing-image.ts
 ├─ components/              # Reusable UI components
 ├─ hooks/                   # Custom hooks (useToast, etc.)
 ├─ lib/                     # Utility functions
public/                      # Static assets
tailwind.config.ts           # Tailwind configuration
next.config.js               # Next.js configuration
package.json                 # Dependencies and scripts
```

## ⚡ Installation

```
bash

git clone https://github.com/SebastianVernis/ChispartMarketingGen
cd chispart-marketing
npm install
```

# or

```
bash

git clone https://github.com/SebastianVernis/ChispartMarketingGen
cd chispart-marketing
yarn install
```

## 🔐 Environment Variables

Create a .env.local file:

```
env
MISTRAL_API_KEY=your_mistral_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Run Locally

```
bash

npm run dev
```

# or

```
yarn dev
```

Visit http://localhost:3000

## ✅ Project Status
🔄 Current version: v1.0

## 🛠️ Next improvements: 

Post scheduling, prompt library, direct export.

## 👥 Contributing
Contributions are welcome!
Open an issue or submit a pull request.

## 📄 License
This project is licensed under the MIT License.

                                    
<div align= "center">
  <a text= "font-segoeui align-center strong">🔥 Desarrollado por Sebastian Vernis | Soluciones Digitales</a>
</div>
<div align= "center">
  <a href="https://sebastianvernis.com">Sebastian Vernis</a>
    <a> | </a>
  <a href="https://chispart.mx">Chispart</a>
</div>
    
<p align="center">
  <img src="assets/Logo.png">
</p>
