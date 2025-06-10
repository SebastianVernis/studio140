
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateTextAction, type GenerateTextActionResult } from './actions';
import { ContentCard, type ContentPost } from '@/components/content-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { FileText, AlertCircle, Sparkles } from 'lucide-react';

const platformOptions = ["Instagram", "Facebook", "Twitter (X)", "LinkedIn", "TikTok"];
const toneOptions = ["Profesional", "Amistoso", "Divertido", "Persuasivo", "Inspirador"];

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState(platformOptions[0]);
  const [tone, setTone] = useState(toneOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<ContentPost[]>([]);

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
        originalTopic: topic, // Store the original topic
      };
      setGeneratedPosts(prevPosts => [newPost, ...prevPosts]); // Add new post to the beginning
    } else if (result.error) {
      setError(result.error);
      // Clear results on error to avoid confusion
      // setGeneratedPosts([]); // User might want to keep old results visible
    }
    setIsLoading(false);
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
            <AlertTitle>¡Atención!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <div className="text-center mb-8">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring btn-transition"
              size="lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={20} className="mr-2" borderColor="border-primary-foreground/50" borderTopColor="border-t-primary-foreground" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generar Contenido
                </>
              )}
            </Button>
          </div>
        </form>

        <div id="results">
          {isLoading && generatedPosts.length === 0 && ( // Show main loader only if no posts exist yet
            <div className="flex flex-col justify-center items-center py-8 text-center">
              <LoadingSpinner size={40} />
              <p className="ml-4 text-muted-foreground mt-3">Generando ideas creativas...</p>
            </div>
          )}

          {!isLoading && generatedPosts.length === 0 && !error && (
            <div className="bg-muted/50 p-6 rounded-xl border border-border flex flex-col justify-center items-center text-center md:col-span-3">
              <FileText className="w-12 h-12 text-primary opacity-75 mb-4" />
              <h3 className="font-semibold text-foreground font-headline">Listo para Crear</h3>
              <p className="text-muted-foreground text-sm">Tus resultados de texto e imagen aparecerán aquí.</p>
            </div>
          )}
          
          {generatedPosts.length > 0 && (
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
          )}
        </div>
      </main>
    </div>
  );
}
