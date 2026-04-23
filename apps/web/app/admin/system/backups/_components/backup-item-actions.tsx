'use client';

import { Copy, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface BackupItemActionsProps {
  backupId: string;
  canDownload: boolean;
  isDownloading: boolean;
  onDownload: (backupId: string) => void;
}

export function BackupItemActions({
  backupId,
  canDownload,
  isDownloading,
  onDownload,
}: BackupItemActionsProps) {
  const { toast } = useToast();

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(backupId);
    toast({
      title: 'ID copiado',
      description: 'O identificador do backup foi copiado para a area de transferencia.',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Abrir menu de ações do backup">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem
          disabled={!canDownload || isDownloading}
          onSelect={(event) => {
            event.preventDefault();

            if (canDownload && !isDownloading) {
              onDownload(backupId);
            }
          }}
        >
          <Download />
          {isDownloading ? 'Preparando download...' : 'Baixar backup'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void handleCopyId();
          }}
        >
          <Copy />
          Copiar ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
