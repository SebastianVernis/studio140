'use client';

import { type FC, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction } from '@/app/actions';
import { LoadingSpinner } from './loading-spinner';
import {
  ImageIcon,
  Copy,
  Sparkles,
  Download,
  RefreshCw,
  Info,
  Eye,
  RefreshCcw,
  Wand2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from './ui/label';

export interface ContentPost {
  id: string;
  mainText: string;
  hashtags: string[];
  originalTopic: string;
  imageUrl?: string;
  mistralImageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
  platform?: string;
  imageType?: string;
  tone?: string;
  language?: string;
  isDualGeneration?: boolean;
}

interface ContentCardProps {
  post: ContentPost;
  onImageGenerated: (postId: string, imageUrl: string, mistralImageUrl?: string) => void;
  onImageGenerationError: (postId: string, error: string) => void;
  onStartImageGeneration: (postId: string) => void;
  onRegenerateText: (
    postId: string,
    originalTopic: string,
    platform: string,
    tone: string,
    language: string
  ) => Promise<void>;
}

export const ContentCard: FC<ContentCardProps> = ({
  post,
  onImageGenerated,
  onImageGenerationError,
  onStartImageGeneration,
  onRegenerateText,
}) => {
  const { toast } = useToast();
  const [isRegeneratingText, setIsRegeneratingText] = useState(false);
  const [isRefineDialogOpen, setIsRefineDialogOpen] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleGenerateImage = async () => {
    onStartImageGeneration(post.id);
    const result = await generateImageAction({
      topic: post.originalTopic,
      platform: post.platform,
      imageType: post.imageType,
      isExistingPrompt: post.isDualGeneration,
    });
    if (result.data?.imageUrl) {
      onImageGenerated(post.id, result.data.imageUrl, result.data.mistralImageUrl);
      if (result.data.mistralImageUrl) {
        toast({
          title: 'Imágenes Generadas',
          description: 'Se generaron dos variaciones de la imagen. ¡Explora ambas opciones!',
        });
      }
    } else {
      onImageGenerationError(post.id, result.error || 'Failed to generate image.');
    }
  };

  const handleRefineImage = async () => {
    if (!refinementPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa un prompt para refinar la imagen.',
        variant: 'destructive',
      });
      return;
    }
    if (!post.imageUrl) {
      toast({
        title: 'Error',
        description: 'No hay imagen base para refinar.',
        variant: 'destructive',
      });
      return;
    }

    onStartImageGeneration(post.id); // Indicate loading state
    setIsRefineDialogOpen(false);

    const result = await generateImageAction({
      topic: refinementPrompt, // This is the refinement instruction
      platform: post.platform,
      imageType: post.imageType,
      baseImageDataUri: post.imageUrl, // Current image as base
    });

    if (result.data?.imageUrl) {
      onImageGenerated(post.id, result.data.imageUrl, result.data.mistralImageUrl);
      toast({
        title: 'Imagen Refinada',
        description: 'La imagen ha sido actualizada con tus indicaciones.',
      });
    } else {
      onImageGenerationError(post.id, result.error || 'Failed to refine image.');
      toast({
        title: 'Error al Refinar',
        description: result.error || 'No se pudo refinar la imagen.',
        variant: 'destructive',
      });
    }
    setRefinementPrompt(''); // Clear prompt after attempt
  };

  const triggerRegenerateText = async () => {
    if (!post.originalTopic || !post.platform || !post.tone || !post.language) {
      toast({
        title: 'Error',
        description: 'Faltan datos (tema, plataforma, tono o idioma) para regenerar el texto.',
        variant: 'destructive',
      });
      return;
    }
    setIsRegeneratingText(true);
    await onRegenerateText(post.id, post.originalTopic, post.platform, post.tone, post.language);
    setIsRegeneratingText(false);
  };

  const handleDownloadImage = (imageType: 'gemini' | 'mistral' = 'gemini') => {
    const imageUrl = imageType === 'mistral' ? post.mistralImageUrl : post.imageUrl;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `chispart-image-${imageType}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Imagen descargada',
      description: `La descarga de la imagen ${imageType === 'mistral' ? 'Mistral' : 'Gemini'} ha comenzado.`,
    });
  };

  const handleCopyToClipboard = () => {
    if (post.mainText.startsWith('Prompt:')) {
      toast({
        title: 'Información',
        description: 'Este es un prompt de imagen, no un texto publicitario.',
        variant: 'default',
      });
      return;
    }
    const textToCopy = `${post.mainText}\n\n${post.hashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast({
          title: 'Copiado!',
          description: 'Contenido copiado al portapapeles.',
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: 'Error',
          description: 'No se pudo copiar el texto.',
          variant: 'destructive',
        });
      });
  };

  const displayImageType = post.imageType?.split('(')[0]?.trim() || 'Imagen';
  const isDirectImagePost = post.mainText.startsWith('Prompt:');

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-lg">
      <CardHeader className="relative flex aspect-video w-full items-center justify-center border-b border-border bg-muted/20 p-0 dark:bg-muted/30">
        {post.isGeneratingImage ? (
          <div className="flex h-full flex-col items-center justify-center">
            <LoadingSpinner size={32} borderTopColor="border-t-primary" />
            <p className="mt-2 text-xs text-muted-foreground">
              Procesando imagen para {post.platform || 'Plataforma Genérica'} ({displayImageType}
              )...
            </p>
          </div>
        ) : post.imageUrl ? (
          <>
            {post.mistralImageUrl ? (
              // Dual image display
              <div className="flex h-full w-full">
                <div className="relative h-full w-1/2 border-r border-border/50">
                  <Image
                    src={post.imageUrl}
                    alt={`Generated image (Gemini) for: ${post.originalTopic.substring(0, 50)} (${displayImageType})`}
                    fill={true}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={`${post.platform || 'social'} ${post.imageType || 'media marketing'}`
                      .toLowerCase()
                      .substring(0, 30)}
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-blue-500/80 px-2 py-1 text-xs font-medium text-white">
                    Gemini
                  </div>
                </div>
                <div className="relative h-full w-1/2">
                  <Image
                    src={post.mistralImageUrl}
                    alt={`Generated image (Mistral) for: ${post.originalTopic.substring(0, 50)} (${displayImageType})`}
                    fill={true}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={`${post.platform || 'social'} ${post.imageType || 'media marketing'}`
                      .toLowerCase()
                      .substring(0, 30)}
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-orange-500/80 px-2 py-1 text-xs font-medium text-white">
                    Mistral
                  </div>
                </div>
              </div>
            ) : (
              // Single image display
              <Image
                src={post.imageUrl}
                alt={`Generated image for: ${post.originalTopic.substring(0, 50)} (${displayImageType})`}
                fill={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                data-ai-hint={`${post.platform || 'social'} ${post.imageType || 'media marketing'}`
                  .toLowerCase()
                  .substring(0, 30)}
              />
            )}

            <div className="absolute left-2 top-2 rounded-lg bg-card/80 p-1.5 text-xs text-foreground shadow-md dark:bg-card/60">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {post.platform}: {displayImageType}
                      </span>
                      {post.mistralImageUrl && <span className="ml-1 text-accent">(Dual)</span>}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Plataforma: {post.platform || 'No especificada'}</p>
                    <p>Tipo de imagen: {post.imageType || 'No especificado'}</p>
                    <p>Tema original: {post.originalTopic}</p>
                    {post.language && post.language !== 'N/A' && <p>Idioma: {post.language}</p>}
                    {post.mistralImageUrl && (
                      <p className="text-accent">Generación dual: Gemini + Mistral</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="absolute right-2 top-2 flex gap-2">
              <Dialog>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Vista Previa"
                          className="h-9 w-9 hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Vista Previa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DialogContent className="max-w-4xl bg-card p-4">
                  <DialogHeader>
                    <DialogTitle>Vista Previa: {post.originalTopic}</DialogTitle>
                  </DialogHeader>
                  <div className="relative mt-2 w-full">
                    {post.mistralImageUrl ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-blue-600">Gemini</h4>
                          <Image
                            src={post.imageUrl}
                            alt={`Vista previa Gemini: ${post.originalTopic}`}
                            width={960}
                            height={540}
                            className="w-full rounded-md object-contain"
                            data-ai-hint="gemini image preview"
                          />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-orange-600">Mistral</h4>
                          <Image
                            src={post.mistralImageUrl}
                            alt={`Vista previa Mistral: ${post.originalTopic}`}
                            width={960}
                            height={540}
                            className="w-full rounded-md object-contain"
                            data-ai-hint="mistral image preview"
                          />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={post.imageUrl}
                        alt={`Vista previa de: ${post.originalTopic}`}
                        width={1920}
                        height={1080}
                        className="max-h-[80vh] w-full rounded-md object-contain"
                        data-ai-hint="image preview"
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              {post.mistralImageUrl ? (
                // Dual download buttons
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadImage('gemini')}
                          title="Descargar Imagen Gemini"
                          className="h-9 w-9 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <Download className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Descargar Gemini</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadImage('mistral')}
                          title="Descargar Imagen Mistral"
                          className="h-9 w-9 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                        >
                          <Download className="h-4 w-4 text-orange-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Descargar Mistral</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                // Single download button
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadImage('gemini')}
                        title="Descargar Imagen"
                        className="h-9 w-9 hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Descargar Imagen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleGenerateImage}
                      title="Volver a Generar Imagen (desde tema original)"
                      className="h-9 w-9 hover:bg-primary/10"
                    >
                      <RefreshCw className="h-4 w-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Regenerar Imagen (desde tema original)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Dialog open={isRefineDialogOpen} onOpenChange={setIsRefineDialogOpen}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Refinar Imagen"
                          className="h-9 w-9 hover:bg-accent/20"
                        >
                          <Wand2 className="h-4 w-4 text-accent" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Refinar Imagen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DialogContent className="bg-card sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Refinar Imagen</DialogTitle>
                    <DialogDescription>
                      Escribe un prompt para modificar la imagen actual. Por ejemplo: &ldquo;hazlo
                      más azul&rdquo;, &ldquo;añade un estilo cyberpunk&rdquo;, &ldquo;cambia el
                      fondo a una playa&rdquo;.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="refine-prompt" className="col-span-1 text-right">
                        Prompt
                      </Label>
                      <Input
                        id="refine-prompt"
                        value={refinementPrompt}
                        onChange={e => setRefinementPrompt(e.target.value)}
                        className="col-span-3"
                        placeholder="Ej: Más vibrante, con luces de neón"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRefineDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleRefineImage}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Aplicar Refinamiento
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : post.imageError ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center text-destructive">
            <ImageIcon className="mb-2 h-10 w-10 text-destructive" />
            Error al crear imagen.
            <p className="mt-1 px-2 text-xs text-muted-foreground">{post.imageError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              className="btn-transition mt-3 bg-card hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className="mr-2 h-4 w-4 text-accent" />
              Volver a Intentar
            </Button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="mb-2 text-xs text-muted-foreground">
              Imagen para: {post.platform || 'Plataforma Genérica'} ({displayImageType})
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              className="btn-transition bg-card hover:bg-accent hover:text-accent-foreground"
            >
              <Sparkles className="mr-2 h-4 w-4 text-accent" />
              Generar Imagen
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-grow flex-col p-4">
        {isRegeneratingText ? (
          <div className="flex flex-grow flex-col items-center justify-center">
            <LoadingSpinner size={24} />
            <p className="mt-2 text-xs text-muted-foreground">Regenerando texto...</p>
          </div>
        ) : (
          <p className="mb-4 flex-grow whitespace-pre-wrap text-sm text-foreground">
            {post.mainText}
          </p>
        )}
        {post.hashtags && post.hashtags.length > 0 && !isDirectImagePost && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-accent/20 text-accent-foreground hover:bg-accent/30"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t border-border p-4 sm:flex-row">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyToClipboard}
          className="btn-transition w-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
          disabled={isDirectImagePost || isRegeneratingText}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar Texto
        </Button>
        {!isDirectImagePost && (
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerRegenerateText}
            className="btn-transition w-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
            disabled={isRegeneratingText || !post.language || post.language === 'N/A'}
          >
            {isRegeneratingText ? (
              <LoadingSpinner size={16} className="mr-2" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Regenerar Texto
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
