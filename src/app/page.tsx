
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateTextAction, type GenerateTextActionResult, generateImageAction, type GenerateImageActionResult } from './actions';
import { ContentCard, type ContentPost } from '@/components/content-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { FileText, AlertCircle, Sparkles, Image as ImageIconLucide, Settings2 } from 'lucide-react';

const platformOptions = ["Instagram", "Facebook", "Twitter (X)", "LinkedIn", "TikTok", "Genérico"];
const toneOptions = ["Profesional", "Amistoso", "Divertido", "Persuasivo", "Inspirador"];

const imageTypeOptionsByPlatform: Record<string, {label: string, value: string}[]> = {
  Instagram: [
    { label: "Cuadrado Feed (1080x1080)", value: "Instagram Square Feed (1080x1080px)" },
    { label: "Vertical Feed (1080x1350)", value: "Instagram Vertical Feed (1080x1350px)" },
    { label: "Horizontal Feed (1080x566)", value: "Instagram Horizontal Feed (1080x566px)" },
    { label: "Historia/Reel (1080x1920)", value: "Instagram Story/Reel (1080x1920px)" },
    { label: "Foto de Perfil (320x320)", value: "Instagram Profile Picture (320x320px)" },
  ],
  Facebook: [
    { label: "Post Cuadrado (1200x1200)", value: "Facebook Square Post (1200x1200px)" },
    { label: "Post Horizontal (1200x630)", value: "Facebook Horizontal Post (1200x630px)" },
    { label: "Portada Página (820x312)", value: "Facebook Page Cover Photo (820x312px)" },
    { label: "Portada Evento (1200x628)", value: "Facebook Event Cover Photo (1200x628px)" },
    { label: "Historia (1080x1920)", value: "Facebook Story (1080x1920px)" },
    { label: "Foto de Perfil (170x170)", value: "Facebook Profile Picture (170x170px)" },
  ],
  "Twitter (X)": [
    { label: "Tweet Horizontal (1024x512)", value: "Twitter (X) Horizontal Tweet Image (1024x512px)" },
    { label: "Tweet Cuadrado (1080x1080)", value: "Twitter (X) Square Tweet Image (1080x1080px)" },
    { label: "Cabecera (1500x500)", value: "Twitter (X) Header Photo (1500x500px)" },
    { label: "Foto de Perfil (400x400)", value: "Twitter (X) Profile Picture (400x400px)" },
  ],
  LinkedIn: [
    { label: "Post Horizontal (1200x627)", value: "LinkedIn Horizontal Post Image (1200x627px)" },
    { label: "Post Cuadrado (1080x1080)", value: "LinkedIn Square Post (1080x1080px)" },
    { label: "Portada (1584x396)", value: "LinkedIn Cover Image (1584x396px)" },
    { label: "Foto de Perfil (400x400)", value: "LinkedIn Profile Picture (400x400px)" },
  ],
  TikTok: [ // Primarily for aspect ratio guidance
    { label: "Vertical (1080x1920)", value: "TikTok Vertical Image (1080x1920px)" },
    { label: "Foto de Perfil (200x200)", value: "TikTok Profile Picture (200x200px)" },
  ],
  Genérico: [
    { label: "Cuadrado (1:1)", value: "Generic Square Image (1:1 aspect ratio)" },
    { label: "Horizontal (16:9)", value: "Generic Horizontal Image (16:9 aspect ratio)" },
    { label: "Vertical (9:16)", value: "Generic Vertical Image (9:16 aspect ratio)" },
    { label: "Banner (3:1)", value: "Generic Banner Image (3:1 aspect ratio)" },
  ]
};

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [selectedTextPlatform, setSelectedTextPlatform] = useState(platformOptions[0]);
  const [selectedTextTone, setSelectedTextTone] = useState(toneOptions[0]);
  const [selectedTextImageType, setSelectedTextImageType] = useState(imageTypeOptionsByPlatform[platformOptions[0]]?.[0]?.value || imageTypeOptionsByPlatform.Genérico[0].value);
  
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<ContentPost[]>([]);

  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedDirectImagePlatform, setSelectedDirectImagePlatform] = useState(platformOptions[0]);
  const [selectedDirectImageType, setSelectedDirectImageType] = useState(imageTypeOptionsByPlatform[platformOptions[0]]?.[0]?.value || imageTypeOptionsByPlatform.Genérico[0].value);
  const [isLoadingDirectImage, setIsLoadingDirectImage] = useState(false);
  const [directImageError, setDirectImageError] = useState<string | null>(null);
  
  const [currentTextImageTypes, setCurrentTextImageTypes] = useState(imageTypeOptionsByPlatform[selectedTextPlatform] || imageTypeOptionsByPlatform.Genérico);
  const [currentDirectImageTypes, setCurrentDirectImageTypes] = useState(imageTypeOptionsByPlatform[selectedDirectImagePlatform] || imageTypeOptionsByPlatform.Genérico);

  useEffect(() => {
    setCurrentTextImageTypes(imageTypeOptionsByPlatform[selectedTextPlatform] || imageTypeOptionsByPlatform.Genérico);
    setSelectedTextImageType(imageTypeOptionsByPlatform[selectedTextPlatform]?.[0]?.value || imageTypeOptionsByPlatform.Genérico[0].value);
  }, [selectedTextPlatform]);

  useEffect(() => {
    setCurrentDirectImageTypes(imageTypeOptionsByPlatform[selectedDirectImagePlatform] || imageTypeOptionsByPlatform.Genérico);
    setSelectedDirectImageType(imageTypeOptionsByPlatform[selectedDirectImagePlatform]?.[0]?.value || imageTypeOptionsByPlatform.Genérico[0].value);
  }, [selectedDirectImagePlatform]);


  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setTextError("Por favor, ingresa un tema o producto.");
      return;
    }

    setIsLoadingText(true);
    setTextError(null);

    const result: GenerateTextActionResult = await generateTextAction({ 
      topic, 
      platform: selectedTextPlatform, 
      tone: selectedTextTone 
    });

    if (result.data) {
      const newPost: ContentPost = {
        id: crypto.randomUUID(),
        mainText: result.data.main_text,
        hashtags: result.data.hashtags,
        originalTopic: topic,
        platform: selectedTextPlatform,
        imageType: selectedTextImageType,
      };
      setGeneratedPosts(prevPosts => [newPost, ...prevPosts]);
      setTopic(''); // Optionally clear topic
    } else if (result.error) {
      setTextError(result.error);
    }
    setIsLoadingText(false);
  };

  const handleGenerateDirectImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) {
      setDirectImageError("Por favor, ingresa un prompt para la imagen.");
      return;
    }

    setIsLoadingDirectImage(true);
    setDirectImageError(null);

    const result: GenerateImageActionResult = await generateImageAction({ 
      topic: imagePrompt,
      platform: selectedDirectImagePlatform,
      imageType: selectedDirectImageType,
    });

    if (result.data?.imageUrl) {
      const newPost: ContentPost = {
        id: crypto.randomUUID(),
        mainText: `Prompt: ${imagePrompt}`,
        hashtags: [], 
        originalTopic: imagePrompt, 
        imageUrl: result.data.imageUrl,
        isGeneratingImage: false, 
        imageError: undefined,
        platform: selectedDirectImagePlatform,
        imageType: selectedDirectImageType,
      };
      setGeneratedPosts(prevPosts => [newPost, ...prevPosts]);
      setImagePrompt(''); 
    } else if (result.error) {
      setDirectImageError(result.error);
    }
    setIsLoadingDirectImage(false);
  };


  const handleImageGenerated = (postId: string, imageUrl: string) => {
    setGeneratedPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, imageUrl, isGeneratingImage: false, imageError: undefined } : p
      )
    );
  };
  
  const handleImageGenerationError = (postId: string, errorMsg: string) => {
    setGeneratedPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, isGeneratingImage: false, imageError: errorMsg } : p
      )
    );
  };

  const handleStartImageGeneration = (postId: string) => {
     setGeneratedPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, isGeneratingImage: true, imageError: undefined, imageUrl: undefined } : p
      )
    );
  }

  return (
    <div className="bg-background flex items-center justify-center min-h-screen p-4">
      <main className="w-full max-w-5xl mx-auto bg-card rounded-2xl shadow-xl p-6 md:p-8">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-headline">Creador de Contenido y Multimedia IA</h1>
          <p className="text-muted-foreground mt-2">Genera posts e imágenes para tus redes sociales en segundos.</p>
        </header>

        {textError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>¡Error al generar texto!</AlertTitle>
            <AlertDescription>{textError}</AlertDescription>
          </Alert>
        )}
         {directImageError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>¡Error al generar imagen!</AlertTitle>
            <AlertDescription>{directImageError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmitText} className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-1">1. Generar Texto Publicitario</h2>
          <p className="text-sm text-muted-foreground mb-4">Define el tema, plataforma, tono y formato de imagen deseado.</p>
          
          <div className="mb-6">
              <Label htmlFor="topic" className="block text-sm font-medium text-foreground mb-2">Tema o Producto Principal</Label>
              <Input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 border-input rounded-lg focus:ring-2 focus:ring-ring"
                placeholder="Ej: Zapatillas ecológicas para correr en montaña"
                disabled={isLoadingText}
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="textPlatform" className="block text-sm font-medium text-foreground mb-2">Plataforma</Label>
              <Select 
                value={selectedTextPlatform} 
                onValueChange={setSelectedTextPlatform} 
                disabled={isLoadingText}
              >
                <SelectTrigger id="textPlatform" className="w-full">
                  <SelectValue placeholder="Selecciona plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="textTone" className="block text-sm font-medium text-foreground mb-2">Tono de Voz</Label>
              <Select 
                value={selectedTextTone} 
                onValueChange={setSelectedTextTone} 
                disabled={isLoadingText}
              >
                <SelectTrigger id="textTone" className="w-full">
                  <SelectValue placeholder="Selecciona tono" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="textImageType" className="block text-sm font-medium text-foreground mb-2">Formato de Imagen</Label>
              <Select 
                value={selectedTextImageType} 
                onValueChange={setSelectedTextImageType} 
                disabled={isLoadingText || currentTextImageTypes.length === 0}
              >
                <SelectTrigger id="textImageType" className="w-full">
                  <SelectValue placeholder="Selecciona formato" />
                </SelectTrigger>
                <SelectContent>
                  {currentTextImageTypes.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <Button 
              type="submit" 
              disabled={isLoadingText} 
              className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring btn-transition"
              size="lg"
            >
              {isLoadingText ? (
                <>
                  <LoadingSpinner size={20} className="mr-2" borderColor="border-primary-foreground/50" borderTopColor="border-t-primary-foreground" />
                  Generando Texto...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generar Texto y Plan de Imagen
                </>
              )}
            </Button>
          </div>
        </form>
        
        <div className="border-t border-border my-8"></div>

        <form onSubmit={handleGenerateDirectImage} className="mb-8">
           <h2 className="text-xl font-semibold text-foreground mb-1">2. Generar Imagen desde Prompt</h2>
           <p className="text-sm text-muted-foreground mb-4">Escribe tu idea, elige la plataforma y el formato para la imagen.</p>
          <div className="mb-6">
            <Label htmlFor="imagePrompt" className="block text-sm font-medium text-foreground mb-2">Tu Prompt Detallado para la Imagen</Label>
            <Textarea
              id="imagePrompt"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full px-4 py-2 border-input rounded-lg focus:ring-2 focus:ring-ring min-h-[80px]"
              placeholder="Ej: Un astronauta sonriente surfeando en una ola cósmica hecha de nebulosas de colores vibrantes, estilo synthwave, iluminación dramática."
              disabled={isLoadingDirectImage}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="directImagePlatform" className="block text-sm font-medium text-foreground mb-2">Plataforma</Label>
              <Select 
                value={selectedDirectImagePlatform} 
                onValueChange={setSelectedDirectImagePlatform} 
                disabled={isLoadingDirectImage}
              >
                <SelectTrigger id="directImagePlatform" className="w-full">
                  <SelectValue placeholder="Selecciona plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="directImageType" className="block text-sm font-medium text-foreground mb-2">Formato de Imagen</Label>
              <Select 
                value={selectedDirectImageType} 
                onValueChange={setSelectedDirectImageType} 
                disabled={isLoadingDirectImage || currentDirectImageTypes.length === 0}
              >
                <SelectTrigger id="directImageType" className="w-full">
                  <SelectValue placeholder="Selecciona formato" />
                </SelectTrigger>
                <SelectContent>
                  {currentDirectImageTypes.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="text-center mt-6">
            <Button 
              type="submit" 
              disabled={isLoadingDirectImage} 
              className="bg-accent text-accent-foreground font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring btn-transition"
              size="lg"
            >
              {isLoadingDirectImage ? (
                <>
                  <LoadingSpinner size={20} className="mr-2" borderColor="border-accent-foreground/50" borderTopColor="border-t-accent-foreground" />
                  Creando Imagen...
                </>
              ) : (
                <>
                  <ImageIconLucide className="mr-2 h-5 w-5" />
                  Generar Solo Imagen
                </>
              )}
            </Button>
          </div>
        </form>

        <div id="results">
          {(isLoadingText && generatedPosts.length === 0) && ( 
            <div className="flex flex-col justify-center items-center py-8 text-center">
              <LoadingSpinner size={40} />
              <p className="ml-4 text-muted-foreground mt-3">Generando ideas creativas...</p>
            </div>
          )}
           {(isLoadingDirectImage && generatedPosts.length === 0) && ( 
            <div className="flex flex-col justify-center items-center py-8 text-center">
              <LoadingSpinner size={40} />
              <p className="ml-4 text-muted-foreground mt-3">Dando vida a tu prompt...</p>
            </div>
          )}


          {!isLoadingText && !isLoadingDirectImage && generatedPosts.length === 0 && !textError && !directImageError && (
            <div className="bg-muted/50 p-6 rounded-xl border border-border flex flex-col justify-center items-center text-center md:col-span-3">
              <Settings2 className="w-12 h-12 text-primary opacity-75 mb-4" />
              <h3 className="font-semibold text-foreground font-headline">Listo para Crear</h3>
              <p className="text-muted-foreground text-sm">Configura tus generadores y tus resultados aparecerán aquí.</p>
            </div>
          )}
          
          {generatedPosts.length > 0 && (
            <>
            <h2 className="text-2xl font-semibold text-foreground mb-6 mt-10 text-center">Resultados Generados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedPosts.map(post => (
                <ContentCard 
                  key={post.id} 
                  post={post} 
                  onImageGenerated={handleImageGenerated}
                  onImageGenerationError={handleImageGenerationError}
                  onStartImageGeneration={handleStartImageGeneration}
                />
              ))}
            </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
