'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RideCardPhotoProps {
  photoUrl: string;
  clientName: string;
}

export function RideCardPhoto({ photoUrl, clientName }: RideCardPhotoProps) {
  const [previewErrorUrl, setPreviewErrorUrl] = useState<string | null>(null);
  const [expandedImageErrorUrl, setExpandedImageErrorUrl] = useState<string | null>(null);
  const hasPreviewError = previewErrorUrl === photoUrl;
  const hasExpandedImageError = expandedImageErrorUrl === photoUrl;

  if (hasPreviewError) {
    return (
      <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-[1.5rem] border border-border-subtle bg-secondary/5 px-4 text-center">
        <p className="text-sm font-medium text-text-secondary">
          Foto indisponível
        </p>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group mt-3 block w-full overflow-hidden rounded-[1.5rem] border border-border-subtle bg-secondary/5 text-left transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={`Abrir foto da corrida de ${clientName}`}
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={photoUrl}
              alt={`Foto da corrida de ${clientName}`}
              fill
              loading="lazy"
              unoptimized
              decoding="async"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={() => setPreviewErrorUrl(photoUrl)}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(92vw,64rem)] border-border-subtle bg-card-background p-3 sm:p-4">
        <DialogHeader className="sr-only">
          <DialogTitle>Foto da corrida</DialogTitle>
          <DialogDescription>
            Visualização ampliada da foto anexada à corrida de {clientName}.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex max-h-[85vh] min-h-[16rem] items-center justify-center overflow-hidden rounded-[1.75rem] bg-black/5">
          {hasExpandedImageError ? (
            <p className="px-4 text-center text-sm font-medium text-text-secondary">
              Foto indisponível
            </p>
          ) : (
            <Image
              src={photoUrl}
              alt={`Foto ampliada da corrida de ${clientName}`}
              width={1600}
              height={1200}
              unoptimized
              decoding="async"
              sizes="92vw"
              onError={() => setExpandedImageErrorUrl(photoUrl)}
              className="h-auto max-h-[80vh] w-full object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
