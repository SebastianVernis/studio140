
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction } from '@/app/actions';
import { LoadingSpinner } from './loading-spinner';
import { Image as ImageIcon, Copy, Sparkles } from 'lucide-react';

export interface ContentPost {
  id: string;
  mainText: string;
  hashtags: string[];
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
    const result = await generateImageAction({ topic: post.mainText });
    if (result.data?.imageUrl) {
      onImageGenerated(post.id, result.data.imageUrl);
    } else {
      onImageGenerationError(post.id, result.error || 'Failed to generate image.');
    }
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
      <CardHeader className="p-0 aspect-video w-full relative bg-slate-50 border-b border-slate-200 flex items-center justify-center">
        {post.isGeneratingImage ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner size={32} borderTopColor="border-t-primary" />
            <p className="text-xs text-muted-foreground mt-2">Creando imagen...</p>
          </div>
        ) : post.imageUrl ? (
          <Image src={post.imageUrl} alt={`Generated image for: ${post.mainText.substring(0, 50)}`} layout="fill" objectFit="cover" data-ai-hint="social media marketing" />
        ) : post.imageError ? (
           <div className="p-4 text-center text-xs text-destructive flex flex-col items-center justify-center">
             <ImageIcon className="w-10 h-10 text-destructive mb-2" />
             Error al crear imagen.
             <p className="text-muted-foreground text-xs mt-1">{post.imageError}</p>
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
      <CardFooter className="p-4 border-t border-slate-100">
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
