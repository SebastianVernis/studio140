
"use client";

import { type FC, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction } from '@/app/actions';
import { LoadingSpinner } from './loading-spinner';
import { ImageIcon, Copy, Sparkles, Download, RefreshCw, Info, Eye, RefreshCcw, FilePenLine } from 'lucide-react';
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
  DialogTitle
} from "@/components/ui/dialog";

export interface ContentPost {
  id: string;
  mainText: string;
  hashtags: string[];
  originalTopic: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
  platform?: string;
  imageType?: string;
  tone?: string; // Added for text regeneration
}

interface ContentCardProps {
  post: ContentPost;
  onImageGenerated: (postId: string, imageUrl: string) => void;
  onImageGenerationError: (postId: string, error: string) => void;
  onStartImageGeneration: (postId: string) => void;
  onRegenerateText: (postId: string, originalTopic: string, platform: string, tone: string) => Promise<void>;
}

export const ContentCard: FC<ContentCardProps> = ({ post, onImageGenerated, onImageGenerationError, onStartImageGeneration, onRegenerateText }) => {
  const { toast } = useToast();
  const [isRegeneratingText, setIsRegeneratingText] = useState(false);

  const handleGenerateImage = async () => {
    onStartImageGeneration(post.id);
    const result = await generateImageAction({
      topic: post.originalTopic,
      platform: post.platform,
      imageType: post.imageType,
    });
    if (result.data?.imageUrl) {
      onImageGenerated(post.id, result.data.imageUrl);
    } else {
      onImageGenerationError(post.id, result.error || 'Failed to generate image.');
    }
  };

  const triggerRegenerateText = async () => {
    if (!post.originalTopic || !post.platform || !post.tone) {
        toast({ title: "Error", description: "Faltan datos (tema, plataforma o tono) para regenerar el texto.", variant: "destructive" });
        return;
    }
    setIsRegeneratingText(true);
    await onRegenerateText(post.id, post.originalTopic, post.platform, post.tone);
    setIsRegeneratingText(false);
  };

  const handleDownloadImage = () => {
    if (!post.imageUrl) return;
    const link = document.createElement('a');
    link.href = post.imageUrl;
    link.download = "chispart-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Imagen descargada',
      description: 'La descarga de la imagen ha comenzado.',
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
    <Card className="flex flex-col h-full overflow-hidden shadow-lg rounded-2xl">
      <CardHeader className="p-0 aspect-video w-full relative bg-muted/20 dark:bg-muted/30 border-b border-border flex items-center justify-center">
        {post.isGeneratingImage ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner size={32} borderTopColor="border-t-primary" />
            <p className="text-xs text-muted-foreground mt-2">Creando imagen para {post.platform || 'Plataforma Genérica'} ({displayImageType})...</p>
          </div>
        ) : post.imageUrl ? (
          <>
            <Image
              src={post.imageUrl}
              alt={`Generated image for: ${post.originalTopic.substring(0, 50)} (${displayImageType})`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{objectFit: "cover"}}
              data-ai-hint={`${post.platform || 'social'} ${post.imageType || 'media marketing'}`.toLowerCase().substring(0,30)}
            />
            <div className="absolute top-2 left-2 bg-card/80 dark:bg-card/60 p-1.5 rounded-lg shadow-md text-xs text-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-muted-foreground" />
                        <span>{post.platform}: {displayImageType}</span>
                     </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Plataforma: {post.platform || 'No especificada'}</p>
                    <p>Tipo de imagen: {post.imageType || 'No especificado'}</p>
                    <p>Tema original: {post.originalTopic}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="absolute bottom-2 right-2 flex gap-2 bg-card/80 dark:bg-card/60 p-1.5 rounded-lg shadow-md">
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
                <DialogContent className="max-w-screen-lg p-4">
                    <DialogHeader>
                        <DialogTitle>Vista Previa: {post.originalTopic}</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full mt-2">
                        <Image
                            src={post.imageUrl}
                            alt={`Vista previa de: ${post.originalTopic}`}
                            width={1920}
                            height={1080}
                            className="rounded-md object-contain w-full max-h-[80vh]"
                            />
                    </div>
                </DialogContent>
              </Dialog>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleDownloadImage} title="Descargar Imagen" className="h-9 w-9 hover:bg-primary/10">
                            <Download className="h-4 w-4 text-primary" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Descargar Imagen</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleGenerateImage} title="Volver a Generar Imagen" className="h-9 w-9 hover:bg-primary/10">
                            <RefreshCw className="h-4 w-4 text-primary" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Regenerar Imagen</p></TooltipContent>
                 </Tooltip>
              </TooltipProvider>
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
                disabled={isRegeneratingText}
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
