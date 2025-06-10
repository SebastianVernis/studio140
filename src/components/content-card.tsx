
"use client";

import type { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction } from '@/app/actions';
import { LoadingSpinner } from './loading-spinner';
import { ImageIcon, Copy, Sparkles, Download, RefreshCw } from 'lucide-react';

export interface ContentPost {
  id: string;
  mainText: string;
  hashtags: string[];
  originalTopic: string; // Added originalTopic
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
}

interface ContentCardProps {
  post: ContentPost;
  onImageGenerated: (postId: string, imageUrl: string) => void;
  onImageGenerationError: (postId: string, error: string) => void;
  onStartImageGeneration: (postId: string) => void;
}

export const ContentCard: FC<ContentCardProps> = ({ post, onImageGenerated, onImageGenerationError, onStartImageGeneration }) => {
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    onStartImageGeneration(post.id);
    // Use post.originalTopic instead of post.mainText for image generation
    const result = await generateImageAction({ topic: post.originalTopic }); 
    if (result.data?.imageUrl) {
      onImageGenerated(post.id, result.data.imageUrl);
    } else {
      onImageGenerationError(post.id, result.error || 'Failed to generate image.');
    }
  };

  const handleDownloadImage = () => {
    if (!post.imageUrl) return;
    const link = document.createElement('a');
    link.href = post.imageUrl;
    // Extract filename if possible, otherwise use a generic one
    let filename = "social-spark-image.png";
    try {
        const urlParts = post.imageUrl.split('/');
        const lastPart = urlParts[urlParts.length -1];
        if (lastPart.includes('.')) { // basic check for extension
            filename = lastPart.split('?')[0]; // remove query params if any
        }
    } catch (e) {
        // fallback to generic name if parsing fails
    }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Imagen descargada',
      description: 'La descarga de la imagen ha comenzado.',
    });
  };

  const handleCopyToClipboard = () => {
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

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg rounded-2xl">
      <CardHeader className="p-0 aspect-video w-full relative bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center justify-center">
        {post.isGeneratingImage ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner size={32} borderTopColor="border-t-primary" />
            <p className="text-xs text-muted-foreground mt-2">Creando imagen...</p>
          </div>
        ) : post.imageUrl ? (
          <>
            <Image src={post.imageUrl} alt={`Generated image for: ${post.originalTopic.substring(0, 50)}`} layout="fill" objectFit="cover" data-ai-hint="social media marketing" />
            <div className="absolute bottom-2 right-2 flex gap-2 bg-card/80 dark:bg-card/60 p-1.5 rounded-lg shadow-md">
              <Button variant="outline" size="icon" onClick={handleDownloadImage} title="Descargar Imagen" className="h-9 w-9 hover:bg-primary/10">
                <Download className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleGenerateImage} title="Volver a Generar Imagen" className="h-9 w-9 hover:bg-primary/10">
                <RefreshCw className="h-4 w-4 text-primary" />
              </Button>
            </div>
          </>
        ) : post.imageError ? (
           <div className="p-4 text-center text-destructive flex flex-col items-center justify-center">
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
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
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
        <p className="text-sm text-foreground mb-4 whitespace-pre-wrap flex-grow">{post.mainText}</p>
        <div className="flex flex-wrap gap-2">
          {post.hashtags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-accent-foreground bg-accent/20 hover:bg-accent/30">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyToClipboard}
          className="w-full text-muted-foreground hover:bg-primary/10 hover:text-primary btn-transition"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar Texto
        </Button>
      </CardFooter>
    </Card>
  );
};
