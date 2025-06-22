
"use client";

import { type FC, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction } from '@/app/actions';
import { LoadingSpinner } from './loading-spinner';
import { ImageIcon, Copy, Sparkles, Download, RefreshCw, Info, Eye, RefreshCcw, Wand2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label }
from './ui/label';

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
  onRegenerateText: (postId: string, originalTopic: string, platform: string, tone: string, language: string) => Promise<void>;
}

export const ContentCard: FC<ContentCardProps> = ({ post, onImageGenerated, onImageGenerationError, onStartImageGeneration, onRegenerateText }) => {
  const { toast } = useToast();
  const [isRegeneratingText, setIsRegeneratingText] = useState(false);
  const [isRefineDialogOpen, setIsRefineDialogOpen] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState("");

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
          title: "Imágenes Generadas", 
          description: "Se generaron dos variaciones de la imagen. ¡Explora ambas opciones!" 
        });
      }
    } else {
      onImageGenerationError(post.id, result.error || 'Failed to generate image.');
    }
  };

  const handleRefineImage = async () => {
    if (!refinementPrompt.trim()) {
      toast({ title: "Error", description: "Por favor, ingresa un prompt para refinar la imagen.", variant: "destructive" });
      return;
    }
    if (!post.imageUrl) {
      toast({ title: "Error", description: "No hay imagen base para refinar.", variant: "destructive" });
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
      toast({ title: "Imagen Refinada", description: "La imagen ha sido actualizada con tus indicaciones." });
    } else {
      onImageGenerationError(post.id, result.error || 'Failed to refine image.');
      toast({ title: "Error al Refinar", description: result.error || 'No se pudo refinar la imagen.', variant: "destructive" });
    }
    setRefinementPrompt(""); // Clear prompt after attempt
  };

  const triggerRegenerateText = async () => {
    if (!post.originalTopic || !post.platform || !post.tone || !post.language) {
        toast({ title: "Error", description: "Faltan datos (tema, plataforma, tono o idioma) para regenerar el texto.", variant: "destructive" });
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
    navigator.clipboard.writeText(textToCopy)
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
    <Card className="flex flex-col h-full overflow-hidden shadow-lg rounded-2xl bg-card">
      <CardHeader className="p-0 aspect-video w-full relative bg-muted/20 dark:bg-muted/30 border-b border-border flex items-center justify-center">
        {post.isGeneratingImage ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner size={32} borderTopColor="border-t-primary" />
            <p className="text-xs text-muted-foreground mt-2">Procesando imagen para {post.platform || 'Plataforma Genérica'} ({displayImageType})...</p>
          </div>
        ) : post.imageUrl ? (
          <>
            {post.mistralImageUrl ? (
              // Dual image display
              <div className="w-full h-full flex">
                <div className="w-1/2 h-full relative border-r border-border/50">
                  <Image
                    src={post.imageUrl}
                    alt={`Generated image (Gemini) for: ${post.originalTopic.substring(0, 50)} (${displayImageType})`}
                    fill={true}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    style={{objectFit: "cover"}}
                    data-ai-hint={`${post.platform || 'social'} ${post.imageType || 'media marketing'}`.toLowerCase().substring(0,30)}
                  />
                  <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white px-2 py-1 rounded text-xs font-medium">
                    Gemini
                  </div>
                </div>
                <div className="w-1/2 h-full relative">
                  <Image
                    src={post.mistralImageUrl}
                    alt={`Generated image (Mistral) for: ${post.originalTopic.substring(0, 50)} (${displayImageType})`}
                    fill={true}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    style={{objectFit: "cover"}}
                    data-ai-hint={`${post.platform || 'social'} ${post.imageType || 'media marketing'}`.toLowerCase().substring(0,30)}
                  />
                  <div className="absolute bottom-2 right-2 bg-orange-500/80 text-white px-2 py-1 rounded text-xs font-medium">
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
                style={{objectFit: "cover"}}
                data-ai-hint={`${post.platform || 'social'} ${post.imageType || 'media marketing'}`.toLowerCase().substring(0,30)}
              />
            )}
            
            <div className="absolute top-2 left-2 bg-card/80 dark:bg-card/60 p-1.5 rounded-lg shadow-md text-xs text-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-muted-foreground" />
                        <span>{post.platform}: {displayImageType}</span>
                        {post.mistralImageUrl && <span className="text-accent ml-1">(Dual)</span>}
                     </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Plataforma: {post.platform || 'No especificada'}</p>
                    <p>Tipo de imagen: {post.imageType || 'No especificado'}</p>
                    <p>Tema original: {post.originalTopic}</p>
                    {post.language && post.language !== 'N/A' && <p>Idioma: {post.language}</p>}
                    {post.mistralImageUrl && <p className="text-accent">Generación dual: Gemini + Mistral</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-2">
              <Dialog>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" title="Vista Previa" className="h-9 w-9 hover:bg-primary/10">
                                    <Eye className="h-4 w-4 text-primary" />
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Vista Previa</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DialogContent className="max-w-4xl p-4 bg-card">
                    <DialogHeader>
                        <DialogTitle>Vista Previa: {post.originalTopic}</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full mt-2">
                        {post.mistralImageUrl ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-blue-600">Gemini</h4>
                              <Image
                                src={post.imageUrl}
                                alt={`Vista previa Gemini: ${post.originalTopic}`}
                                width={960}
                                height={540}
                                className="rounded-md object-contain w-full"
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
                                className="rounded-md object-contain w-full"
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
                            className="rounded-md object-contain w-full max-h-[80vh]"
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
                            <Button variant="outline" size="icon" onClick={() => handleDownloadImage('gemini')} title="Descargar Imagen Gemini" className="h-9 w-9 hover:bg-blue-100 dark:hover:bg-blue-900/20">
                                <Download className="h-4 w-4 text-blue-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Descargar Gemini</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => handleDownloadImage('mistral')} title="Descargar Imagen Mistral" className="h-9 w-9 hover:bg-orange-100 dark:hover:bg-orange-900/20">
                                <Download className="h-4 w-4 text-orange-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Descargar Mistral</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                // Single download button
                <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleDownloadImage('gemini')} title="Descargar Imagen" className="h-9 w-9 hover:bg-primary/10">
                              <Download className="h-4 w-4 text-primary" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>Descargar Imagen</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleGenerateImage} title="Volver a Generar Imagen (desde tema original)" className="h-9 w-9 hover:bg-primary/10">
                            <RefreshCw className="h-4 w-4 text-primary" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Regenerar Imagen (desde tema original)</p></TooltipContent>
                 </Tooltip>
              </TooltipProvider>
               <Dialog open={isRefineDialogOpen} onOpenChange={setIsRefineDialogOpen}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" title="Refinar Imagen" className="h-9 w-9 hover:bg-accent/20">
                                    <Wand2 className="h-4 w-4 text-accent" />
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Refinar Imagen</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DialogContent className="sm:max-w-[425px] bg-card">
                    <DialogHeader>
                    <DialogTitle>Refinar Imagen</DialogTitle>
                    <DialogDescription>
                        Escribe un prompt para modificar la imagen actual. Por ejemplo: "hazlo más azul", "añade un estilo cyberpunk", "cambia el fondo a una playa".
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="refine-prompt" className="text-right col-span-1">
                        Prompt
                        </Label>
                        <Input
                        id="refine-prompt"
                        value={refinementPrompt}
                        onChange={(e) => setRefinementPrompt(e.target.value)}
                        className="col-span-3"
                        placeholder="Ej: Más vibrante, con luces de neón"
                        />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRefineDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" onClick={handleRefineImage} className="bg-accent text-accent-foreground hover:bg-accent/90">Aplicar Refinamiento</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : post.imageError ? (
           <div className="p-4 text-center text-destructive flex flex-col items-center justify-center h-full">
             <ImageIcon className="w-10 h-10 text-destructive mb-2" />
             Error al crear imagen.
             <p className="text-muted-foreground text-xs mt-1 px-2">{post.imageError}</p>
             <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateImage}
                className="mt-3 bg-card hover:bg-accent hover:text-accent-foreground btn-transition"
              >
                <RefreshCw className="mr-2 h-4 w-4 text-accent" />
                Volver a Intentar
              </Button>
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center h-full">
            <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground mb-2">
              Imagen para: {post.platform || 'Plataforma Genérica'} ({displayImageType})
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              className="bg-card hover:bg-accent hover:text-accent-foreground btn-transition"
            >
              <Sparkles className="mr-2 h-4 w-4 text-accent" />
              Generar Imagen
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        {isRegeneratingText ? (
             <div className="flex flex-col items-center justify-center flex-grow">
                <LoadingSpinner size={24} />
                <p className="text-xs text-muted-foreground mt-2">Regenerando texto...</p>
            </div>
        ) : (
            <p className="text-sm text-foreground mb-4 whitespace-pre-wrap flex-grow">{post.mainText}</p>
        )}
        {post.hashtags && post.hashtags.length > 0 && !isDirectImagePost && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-accent-foreground bg-accent/20 hover:bg-accent/30">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border flex flex-col sm:flex-row gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyToClipboard}
          className="w-full text-muted-foreground hover:bg-primary/10 hover:text-primary btn-transition"
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
                className="w-full text-muted-foreground hover:bg-primary/10 hover:text-primary btn-transition"
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
