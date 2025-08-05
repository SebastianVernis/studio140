'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  generateTextAction,
  type GenerateTextActionResult,
  generateImageAction,
  type GenerateImageActionResult,
} from './actions';
import { ContentCard, type ContentPost } from '@/components/content-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AlertCircle, Sparkles, Image as ImageIconLucide, Settings2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const platformOptions = ['Instagram', 'Facebook', 'Twitter (X)', 'LinkedIn', 'TikTok', 'Genérico'];
const toneOptions = [
  'Profesional',
  'Amistoso',
  'Divertido',
  'Persuasivo',
  'Inspirador',
  'Futurista',
];
const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English (Inglés)', value: 'en' },
  { label: '中文 (Chino Mandarín)', value: 'zh-CN' },
  { label: 'हिन्दी (Hindi)', value: 'hi' },
  { label: 'العربية (Árabe)', value: 'ar' },
  { label: 'Français (Francés)', value: 'fr' },
];

const imageTypeOptionsByPlatform: Record<string, { label: string; value: string }[]> = {
  Instagram: [
    { label: 'Cuadrado Feed (1080x1080)', value: 'Instagram Square Feed (1080x1080px)' },
    { label: 'Vertical Feed (1080x1350)', value: 'Instagram Vertical Feed (1080x1350px)' },
    { label: 'Horizontal Feed (1080x566)', value: 'Instagram Horizontal Feed (1080x566px)' },
    { label: 'Historia/Reel (1080x1920)', value: 'Instagram Story/Reel (1080x1920px)' },
    { label: 'Foto de Perfil (320x320)', value: 'Instagram Profile Picture (320x320px)' },
  ],
  Facebook: [
    { label: 'Post Cuadrado (1200x1200)', value: 'Facebook Square Post (1200x1200px)' },
    { label: 'Post Horizontal (1200x630)', value: 'Facebook Horizontal Post (1200x630px)' },
    { label: 'Portada Página (820x312)', value: 'Facebook Page Cover Photo (820x312px)' },
    { label: 'Portada Evento (1200x628)', value: 'Facebook Event Cover Photo (1200x628px)' },
    { label: 'Historia (1080x1920)', value: 'Facebook Story (1080x1920px)' },
    { label: 'Foto de Perfil (170x170)', value: 'Facebook Profile Picture (170x170px)' },
  ],
  'Twitter (X)': [
    {
      label: 'Tweet Horizontal (1024x512)',
      value: 'Twitter (X) Horizontal Tweet Image (1024x512px)',
    },
    { label: 'Tweet Cuadrado (1080x1080)', value: 'Twitter (X) Square Tweet Image (1080x1080px)' },
    { label: 'Cabecera (1500x500)', value: 'Twitter (X) Header Photo (1500x500px)' },
    { label: 'Foto de Perfil (400x400)', value: 'Twitter (X) Profile Picture (400x400px)' },
  ],
  LinkedIn: [
    { label: 'Post Horizontal (1200x627)', value: 'LinkedIn Horizontal Post Image (1200x627px)' },
    { label: 'Post Cuadrado (1080x1080)', value: 'LinkedIn Square Post (1080x1080px)' },
    { label: 'Portada (1584x396)', value: 'LinkedIn Cover Image (1584x396px)' },
    { label: 'Foto de Perfil (400x400)', value: 'LinkedIn Profile Picture (400x400px)' },
  ],
  TikTok: [
    { label: 'Vertical (1080x1920)', value: 'TikTok Vertical Image (1080x1920px)' },
    { label: 'Foto de Perfil (200x200)', value: 'TikTok Profile Picture (200x200px)' },
  ],
  Genérico: [
    { label: 'Cuadrado (1:1)', value: 'Generic Square Image (1:1 aspect ratio)' },
    { label: 'Horizontal (16:9)', value: 'Generic Horizontal Image (16:9 aspect ratio)' },
    { label: 'Vertical (9:16)', value: 'Generic Vertical Image (9:16 aspect ratio)' },
    { label: 'Banner (3:1)', value: 'Generic Banner Image (3:1 aspect ratio)' },
  ],
};

export default function HomePage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [selectedTextPlatform, setSelectedTextPlatform] = useState(platformOptions[0]);
  const [selectedTextTone, setSelectedTextTone] = useState(toneOptions[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]?.value || 'es');
  const [selectedTextImageType, setSelectedTextImageType] = useState(() => {
    const platform = platformOptions[0];
    return (
      imageTypeOptionsByPlatform[platform]?.[0]?.value ||
      imageTypeOptionsByPlatform['Genérico']?.[0]?.value ||
      ''
    );
  });

  const [isLoadingText, setIsLoadingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<ContentPost[]>([]);

  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedDirectImagePlatform, setSelectedDirectImagePlatform] = useState(
    platformOptions[0]
  );
  const [selectedDirectImageType, setSelectedDirectImageType] = useState(
    imageTypeOptionsByPlatform[platformOptions[0]]?.[0]?.value ||
      imageTypeOptionsByPlatform.Genérico[0].value
  );
  const [isLoadingDirectImage, setIsLoadingDirectImage] = useState(false);
  const [directImageError, setDirectImageError] = useState<string | null>(null);

  const [currentTextImageTypes, setCurrentTextImageTypes] = useState(
    imageTypeOptionsByPlatform[selectedTextPlatform] || imageTypeOptionsByPlatform.Genérico
  );
  const [currentDirectImageTypes, setCurrentDirectImageTypes] = useState(
    imageTypeOptionsByPlatform[selectedDirectImagePlatform] || imageTypeOptionsByPlatform.Genérico
  );

  const [uploadedBaseImage, setUploadedBaseImage] = useState<string | null>(null);
  const [uploadedBaseImagePreview, setUploadedBaseImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTextImageTypes(
      imageTypeOptionsByPlatform[selectedTextPlatform] || imageTypeOptionsByPlatform.Genérico
    );
    setSelectedTextImageType(
      imageTypeOptionsByPlatform[selectedTextPlatform]?.[0]?.value ||
        imageTypeOptionsByPlatform.Genérico[0].value
    );
  }, [selectedTextPlatform]);

  useEffect(() => {
    setCurrentDirectImageTypes(
      imageTypeOptionsByPlatform[selectedDirectImagePlatform] || imageTypeOptionsByPlatform.Genérico
    );
    setSelectedDirectImageType(
      imageTypeOptionsByPlatform[selectedDirectImagePlatform]?.[0]?.value ||
        imageTypeOptionsByPlatform.Genérico[0].value
    );
  }, [selectedDirectImagePlatform]);

  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setTextError('Por favor, ingresa un tema o producto.');
      return;
    }

    setIsLoadingText(true);
    setTextError(null);

    const result: GenerateTextActionResult = await generateTextAction({
      topic,
      platform: selectedTextPlatform,
      tone: selectedTextTone,
      language: selectedLanguage,
    });

    if (result.data) {
      const newPost: ContentPost = {
        id: crypto.randomUUID(),
        mainText: result.data.main_text,
        hashtags: result.data.hashtags,
        originalTopic: topic,
        platform: selectedTextPlatform,
        imageType: selectedTextImageType,
        tone: selectedTextTone,
        language: selectedLanguage,
      };
      setGeneratedPosts(prevPosts => [newPost, ...prevPosts]);
      setTopic('');
    } else if (result.error) {
      setTextError(result.error);
    }
    setIsLoadingText(false);
  };

  const handleRegenerateText = async (
    postId: string,
    originalTopic: string,
    platform: string,
    tone: string,
    language: string
  ) => {
    const result: GenerateTextActionResult = await generateTextAction({
      topic: originalTopic,
      platform: platform,
      tone: tone,
      language: language,
    });

    if (result.data) {
      setGeneratedPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? { ...p, mainText: result.data.main_text, hashtags: result.data.hashtags }
            : p
        )
      );
      toast({
        title: 'Texto Regenerado',
        description: 'El contenido del texto ha sido actualizado.',
      });
    } else if (result.error) {
      toast({
        title: 'Error al Regenerar Texto',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleBaseImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = loadEvent => {
        const dataUri = loadEvent.target?.result as string;
        setUploadedBaseImage(dataUri);
        setUploadedBaseImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBaseImage = () => {
    setUploadedBaseImage(null);
    setUploadedBaseImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateDirectImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) {
      setDirectImageError('Por favor, ingresa un prompt para la imagen.');
      return;
    }

    setIsLoadingDirectImage(true);
    setDirectImageError(null);

    const result: GenerateImageActionResult = await generateImageAction({
      topic: imagePrompt,
      platform: selectedDirectImagePlatform,
      imageType: selectedDirectImageType,
      baseImageDataUri: uploadedBaseImage || undefined,
    });

    if (result.data?.imageUrl) {
      const newPost: ContentPost = {
        id: crypto.randomUUID(),
        mainText: `Prompt: ${imagePrompt}${uploadedBaseImagePreview ? ' (con imagen base)' : ''}`,
        hashtags: [],
        originalTopic: imagePrompt,
        imageUrl: result.data.imageUrl,
        mistralImageUrl: result.data.mistralImageUrl,
        isGeneratingImage: false,
        imageError: undefined,
        platform: selectedDirectImagePlatform,
        imageType: selectedDirectImageType,
        tone: 'N/A',
        language: 'N/A',
      };
      setGeneratedPosts(prevPosts => [newPost, ...prevPosts]);
      setImagePrompt('');
      removeBaseImage();
    } else if (result.error) {
      setDirectImageError(result.error);
    }
    setIsLoadingDirectImage(false);
  };

  const handleImageGenerated = (postId: string, imageUrl: string, mistralImageUrl?: string) => {
    setGeneratedPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, imageUrl, mistralImageUrl, isGeneratingImage: false, imageError: undefined }
          : p
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
        p.id === postId
          ? {
              ...p,
              isGeneratingImage: true,
              imageError: undefined,
              imageUrl: undefined,
              mistralImageUrl: undefined,
            }
          : p
      )
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <main className="mx-auto w-full max-w-5xl rounded-2xl bg-card p-6 shadow-xl md:p-8">
        <header className="mb-6 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            CHISPART Marketing
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Tu chispa creativa para contenido y multimedia IA.
          </p>
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
          <h2 className="mb-1 text-xl font-semibold text-accent">1. Generar Texto Publicitario</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Define el tema, plataforma, tono, idioma y formato de imagen deseado.
          </p>

          <div className="mb-6">
            <Label htmlFor="topic" className="mb-2 block text-sm font-medium text-foreground">
              Tema o Producto Principal
            </Label>
            <Input
              type="text"
              id="topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full rounded-lg border-input px-4 py-2 focus:ring-2 focus:ring-ring"
              disabled={isLoadingText}
            />
            <p className="ml-1 mt-1.5 text-xs text-muted-foreground">
              Ej: Zapatillas cyber-punk autoajustables
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label
                htmlFor="textPlatform"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Plataforma
              </Label>
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
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="textTone" className="mb-2 block text-sm font-medium text-foreground">
                Tono de Voz
              </Label>
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
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language" className="mb-2 block text-sm font-medium text-foreground">
                Idioma
              </Label>
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
                disabled={isLoadingText}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Selecciona idioma" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="textImageType"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Formato de Imagen
              </Label>
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
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <Button
              type="submit"
              disabled={isLoadingText}
              className="btn-transition w-full rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-auto"
              size="lg"
            >
              {isLoadingText ? (
                <>
                  <LoadingSpinner
                    size={20}
                    className="mr-2"
                    borderColor="border-primary-foreground/50"
                    borderTopColor="border-t-primary-foreground"
                  />
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

        <div className="my-8 border-t border-border"></div>

        <form onSubmit={handleGenerateDirectImage} className="mb-8">
          <h2 className="mb-1 text-xl font-semibold text-accent">2. Generar Imagen desde Prompt</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Escribe tu idea, sube una imagen base (opcional), elige plataforma y formato.
          </p>

          <div className="mb-4">
            <Label
              htmlFor="baseImageUpload"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Imagen Base (Opcional)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="baseImageUpload"
                type="file"
                accept="image/*"
                onChange={handleBaseImageUpload}
                className="block w-full text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                disabled={isLoadingDirectImage}
                ref={fileInputRef}
              />
            </div>
          </div>

          {uploadedBaseImagePreview && (
            <div className="relative mb-4 h-40 w-40 rounded-md border border-input p-1">
              <Image
                src={uploadedBaseImagePreview}
                alt="Vista previa de imagen base"
                fill={true}
                sizes="(max-width: 160px) 100vw, 160px"
                style={{ objectFit: 'contain' }}
                className="rounded"
                data-ai-hint="uploaded image preview"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-card text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground"
                onClick={removeBaseImage}
                title="Quitar imagen base"
                disabled={isLoadingDirectImage}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className="mb-6">
            <Label htmlFor="imagePrompt" className="mb-2 block text-sm font-medium text-foreground">
              Tu Prompt Detallado para la Imagen
            </Label>
            <Textarea
              id="imagePrompt"
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
              className="min-h-[80px] w-full rounded-lg border-input px-4 py-2 focus:ring-2 focus:ring-ring"
              disabled={isLoadingDirectImage}
            />
            <p className="ml-1 mt-1.5 text-xs text-muted-foreground">
              Ej: Un holograma brillante de un fénix resurgiendo de datos binarios, ciudad cyberpunk
              de fondo, lluvia de neón.
            </p>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label
                htmlFor="directImagePlatform"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Plataforma
              </Label>
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
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="directImageType"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Formato de Imagen
              </Label>
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
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Button
              type="submit"
              disabled={isLoadingDirectImage}
              className="btn-transition w-full rounded-lg bg-accent px-8 py-3 font-semibold text-accent-foreground shadow-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-auto"
              size="lg"
            >
              {isLoadingDirectImage ? (
                <>
                  <LoadingSpinner
                    size={20}
                    className="mr-2"
                    borderColor="border-accent-foreground/50"
                    borderTopColor="border-t-accent-foreground"
                  />
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
          {isLoadingText && generatedPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LoadingSpinner size={40} />
              <p className="ml-4 mt-3 text-muted-foreground">Generando ideas creativas...</p>
            </div>
          )}
          {isLoadingDirectImage && generatedPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LoadingSpinner size={40} />
              <p className="ml-4 mt-3 text-muted-foreground">Dando vida a tu prompt...</p>
            </div>
          )}

          {!isLoadingText &&
            !isLoadingDirectImage &&
            generatedPosts.length === 0 &&
            !textError &&
            !directImageError && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/50 p-6 text-center md:col-span-3">
                <Settings2 className="mb-4 h-12 w-12 text-primary opacity-75" />
                <h3 className="font-headline font-semibold text-foreground">Listo para Crear</h3>
                <p className="text-sm text-muted-foreground">
                  Configura tus generadores y tus resultados aparecerán aquí.
                </p>
              </div>
            )}

          {generatedPosts.length > 0 && (
            <>
              <h2 className="mb-6 mt-10 text-center text-2xl font-semibold text-primary">
                Resultados Generados
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {generatedPosts.map(post => (
                  <ContentCard
                    key={post.id}
                    post={post}
                    onImageGenerated={handleImageGenerated}
                    onImageGenerationError={handleImageGenerationError}
                    onStartImageGeneration={handleStartImageGeneration}
                    onRegenerateText={handleRegenerateText}
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
