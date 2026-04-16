'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FileDown } from 'lucide-react';
import type { ClientExportController } from '@/app/dashboard/clients/_hooks/use-client-export';
import { DateRangePicker } from '@/components/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { buttonVariants } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  CLIENT_EXPORT_OPTIONS,
  getClientExportTypeLabel,
  type ClientExportType,
} from '@/services/client-export.types';

interface ClientExportActionsProps {
  controller: ClientExportController;
  drawerPortalContainer: HTMLElement | null;
}

function getExportButtonLabel(type: ClientExportType) {
  return getClientExportTypeLabel(type);
}

export function ClientExportActions({
  controller,
  drawerPortalContainer,
}: ClientExportActionsProps) {
  const isMobile = useIsMobile();

  const renderPicker = (type: ClientExportType) => (
    <DateRangePicker
      title={getExportButtonLabel(type)}
      description={`Selecione data inicial e final para gerar o PDF de ${getClientExportTypeLabel(type).toLowerCase()}.`}
      value={controller.dateRange}
      onChange={controller.setDateRange}
      onApplyPreset={controller.applyPreset}
      onClear={controller.clearDateRange}
      onConfirm={() => void controller.submitExport()}
      isLoading={controller.isExporting}
      isConfirmDisabled={controller.isSubmitDisabled}
      errorMessage={controller.errorMessage}
      confirmLabel="Baixar PDF"
    />
  );

  const mobileOverlay =
    isMobile && drawerPortalContainer
      ? createPortal(
          <AnimatePresence>
            {controller.isOpen ? (
              <motion.div
                className="absolute inset-0 z-[130] flex items-center justify-center bg-black/10 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <button
                  type="button"
                  aria-label="Fechar seletor de periodo"
                  onClick={controller.closeExport}
                  className="absolute inset-0"
                />
                <motion.div
                  className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-border-subtle bg-modal-background shadow-2xl"
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={(event) => event.stopPropagation()}
                >
                  {renderPicker(controller.selectedType)}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          drawerPortalContainer,
        )
      : null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {CLIENT_EXPORT_OPTIONS.map((option) => {
          const isOpen = controller.isOpen && controller.selectedType === option.value;

          if (isMobile) {
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => controller.openExport(option.value)}
                disabled={controller.isTriggerDisabled}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'h-auto min-w-0 rounded-2xl border border-border-subtle bg-secondary/10 px-3 py-3 text-sm font-semibold text-text-secondary hover:bg-secondary/15 hover:text-text-primary',
                )}
              >
                <FileDown size={16} />
                {getExportButtonLabel(option.value)}
              </button>
            );
          }

          return (
            <Popover
              key={option.value}
              open={isOpen}
              onOpenChange={(open) => {
                if (open) {
                  controller.openExport(option.value);
                  return;
                }

                controller.closeExport();
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={controller.isTriggerDisabled}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'h-auto min-w-0 rounded-2xl border border-border-subtle bg-secondary/10 px-3 py-3 text-sm font-semibold text-text-secondary hover:bg-secondary/15 hover:text-text-primary',
                  )}
                >
                  <FileDown size={16} />
                  {getExportButtonLabel(option.value)}
                </button>
              </PopoverTrigger>

              <PopoverContent
                container={drawerPortalContainer}
                align="start"
                side="bottom"
                sideOffset={12}
                collisionPadding={20}
                className="z-[120] w-[min(calc(100vw-4rem),22rem)] rounded-[1.75rem] border-border-subtle bg-modal-background p-0 shadow-2xl data-[state=closed]:duration-150 data-[state=open]:duration-200"
              >
                {renderPicker(option.value)}
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
      {mobileOverlay}
    </>
  );
}
