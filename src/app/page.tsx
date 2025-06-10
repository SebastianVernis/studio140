
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateTextAction, type GenerateTextActionResult, generateImageAction, type GenerateImageActionResult } from './actions';
import { ContentCard, type ContentPost } from '@/components/content-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { FileText, AlertCircle, Sparkles, Image as ImageIconLucide } from 'lucide-react';

const platformOptions = ["Instagram", "Facebook", "Twitter (X)", "LinkedIn", "TikTok"];
const toneOptions = ["Profesional", "Amistoso", "Divertido", "Persuasivo", "Inspirador"];

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState(platformOptions[0]);
  const [tone, setTone] = useState(toneOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<ContentPost[]>([]);

  const [imagePrompt, setImagePrompt] = useState('');
  const [isLoadingDirectImage, setIsLoadingDirectImage] = useState(false);
  const [directImageError, setDirectImageError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Por favor, ingresa un tema o producto.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result: GenerateTextActionResult = await generateTextAction({ topic, platform, tone });

    if (result.data) {
      const newPost: ContentPost = {
        id: crypto.randomUUID(),
        mainText: result.data.main_text,
        hashtags: result.data.hashtags,
        originalTopic: topic,
      };
      setGeneratedPosts(prevPosts => [newPost, ...prevPosts]);
    } else if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleGenerateDirectImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) {
      setDirectImageError("Por favor, ingresa un prompt para la imagen.");
      return;
    }

    setIsLoadingDirectImage(true);
    setDirectImageError(null);

    const result: GenerateImageActionResult = await generateImageAction({ topic: imagePrompt });

    if (result.data?.imageUrl) {
      const newPost: ContentPost = {
        id: crypto.randomUUID(),
        mainText: `Prompt: ${imagePrompt}`, // Display the prompt as main text
        hashtags: [], // No hashtags for direct image generation
        originalTopic: imagePrompt, // Store the prompt for potential re-generation
        imageUrl: result.data.imageUrl,
        isGeneratingImage: false, // Image is already generated
        imageError: undefined,
      };
      setGeneratedPosts(prevPosts => [newPost, ...prevPosts]);
      setImagePrompt(''); // Clear the prompt field
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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>¡Error al generar texto!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
         {directImageError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>¡Error al generar imagen!</AlertTitle>
            <AlertDescription>{directImageError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Generar Texto Publicitario</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="topic" className="block text-sm font-medium text-foreground mb-2">Tema o Producto</Label>
              <Input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 border-input rounded-lg focus:ring-2 focus:ring-ring"
                placeholder="Ej: Zapatillas para correr"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="platform" className="block text-sm font-medium text-foreground mb-2">Plataforma</Label>
              <Select value={platform} onValueChange={setPlatform} disabled={isLoading}>
                <SelectTrigger id="platform" className="w-full">
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
              <Label htmlFor="tone" className="block text-sm font-medium text-foreground mb-2">Tono de Voz</Label>
              <Select value={tone} onValueChange={setTone} disabled={isLoading}>
                <SelectTrigger id="tone" className="w-full">
                  <SelectValue placeholder="Selecciona tono" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring btn-transition"
              size="lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={20} className="mr-2" borderColor="border-primary-foreground/50" borderTopColor="border-t-primary-foreground" />
                  Generando Texto...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generar Texto
                </>
              )}
            </Button>
          </div>
        </form>
        
        <div className="border-t border-border my-8"></div>

        <form onSubmit={handleGenerateDirectImage} className="mb-8">
           <h2 className="text-xl font-semibold text-foreground mb-3">2. Generar Imagen desde Prompt</h2>
          <div>
            <Label htmlFor="imagePrompt" className="block text-sm font-medium text-foreground mb-2">Tu Prompt para la Imagen</Label>
            <Textarea
              id="imagePrompt"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full px-4 py-2 border-input rounded-lg focus:ring-2 focus:ring-ring min-h-[80px]"
              placeholder="Ej: Un astronauta surfeando en una ola cósmica, estilo synthwave."
              disabled={isLoadingDirectImage}
            />
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
          {(isLoading && generatedPosts.length === 0) && ( 
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


          {!isLoading && !isLoadingDirectImage && generatedPosts.length === 0 && !error && !directImageError && (
            <div className="bg-muted/50 p-6 rounded-xl border border-border flex flex-col justify-center items-center text-center md:col-span-3">
              <FileText className="w-12 h-12 text-primary opacity-75 mb-4" />
              <h3 className="font-semibold text-foreground font-headline">Listo para Crear</h3>
              <p className="text-muted-foreground text-sm">Tus resultados de texto e imagen aparecerán aquí.</p>
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

    