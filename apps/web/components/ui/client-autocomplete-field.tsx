'use client';

import { Loader2, Search, User as UserIcon, X } from 'lucide-react';
import { type ReactNode } from 'react';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { type ClientAutocompleteState } from '@/hooks/use-client-autocomplete';
import { parseApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';

interface ClientAutocompleteFieldProps {
  autocomplete: ClientAutocompleteState;
  placeholder: string;
  inputClassName?: string;
  popoverContentClassName?: string;
  statusClassName?: string;
  appliedHint?: ReactNode;
  footerHint?: ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
  fetchingMessage?: string;
  errorFallbackMessage?: string;
  minLengthMessage?: (minimumLength: number) => string;
}

function getAutocompleteStatusMessage({
  autocomplete,
  emptyMessage = 'Nenhum cliente encontrado para a busca informada.',
  loadingMessage = 'Buscando clientes...',
  fetchingMessage = 'Atualizando sugestoes...',
  minLengthMessage,
}: Pick<
  ClientAutocompleteFieldProps,
  | 'autocomplete'
  | 'emptyMessage'
  | 'loadingMessage'
  | 'fetchingMessage'
  | 'minLengthMessage'
>) {
  if (autocomplete.hasSearchValue && !autocomplete.hasMinimumSearchLength) {
    return minLengthMessage
      ? minLengthMessage(autocomplete.minimumSearchLength)
      : `Digite ao menos ${autocomplete.minimumSearchLength} letras para buscar clientes.`;
  }

  if (autocomplete.isLoading) {
    return loadingMessage;
  }

  if (autocomplete.isFetching && autocomplete.isReady) {
    return fetchingMessage;
  }

  if (autocomplete.hasEmptyResults) {
    return emptyMessage;
  }

  return null;
}

export function ClientAutocompleteField({
  autocomplete,
  placeholder,
  inputClassName,
  popoverContentClassName,
  statusClassName,
  appliedHint,
  footerHint,
  emptyMessage,
  loadingMessage,
  fetchingMessage,
  errorFallbackMessage = 'Nao foi possivel carregar os clientes.',
  minLengthMessage,
}: ClientAutocompleteFieldProps) {
  const statusMessage = getAutocompleteStatusMessage({
    autocomplete,
    emptyMessage,
    loadingMessage,
    fetchingMessage,
    minLengthMessage,
  });

  return (
    <div>
      <Popover
        open={autocomplete.isOpen}
        onOpenChange={autocomplete.onOpenChange}
      >
        <PopoverAnchor asChild>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <Input
              role="combobox"
              aria-expanded={autocomplete.isOpen}
              aria-autocomplete="list"
              aria-busy={autocomplete.isLoading || autocomplete.isFetching}
              autoComplete="off"
              value={autocomplete.searchText}
              onChange={(event) =>
                autocomplete.setSearchText(event.target.value)
              }
              onFocus={autocomplete.onFocus}
              placeholder={placeholder}
              className={cn(
                'h-11 rounded-xl border-border-subtle bg-card-background pl-10 pr-10 font-medium text-text-primary shadow-sm md:h-12',
                inputClassName,
              )}
            />
            {(autocomplete.searchText || autocomplete.hasAppliedClient) && (
              <button
                type="button"
                onClick={autocomplete.onClear}
                className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition hover:bg-hover-accent hover:text-text-primary"
                aria-label="Limpar cliente"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'w-[var(--radix-popover-trigger-width)] rounded-xl border border-border-subtle bg-card-background p-0 shadow-xl',
            popoverContentClassName,
          )}
        >
          <div className="max-h-72 overflow-y-auto p-2">
            {autocomplete.isLoading && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-text-secondary">
                <Loader2 className="size-4 animate-spin" />
                {loadingMessage || 'Buscando clientes...'}
              </div>
            )}

            {!autocomplete.isLoading && autocomplete.isError && (
              <div className="rounded-lg border border-border-destructive/20 bg-button-destructive-subtle px-3 py-3 text-sm text-icon-destructive">
                <p>
                  {parseApiError(
                    autocomplete.error,
                    errorFallbackMessage,
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void autocomplete.refetch();
                  }}
                  className="mt-2 font-bold uppercase tracking-widest underline underline-offset-4"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!autocomplete.isLoading &&
              !autocomplete.isError &&
              autocomplete.hasEmptyResults && (
                <div className="rounded-lg px-3 py-3 text-sm font-medium text-text-secondary">
                  {emptyMessage || 'Nenhum cliente encontrado para a busca informada.'}
                </div>
              )}

            {!autocomplete.isLoading &&
              !autocomplete.isError &&
              autocomplete.suggestions.length > 0 && (
                <div className="space-y-1">
                  {autocomplete.suggestions.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => autocomplete.onSelect(client)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-hover-accent"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserIcon size={14} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {client.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
          </div>

          {!autocomplete.isLoading &&
            !autocomplete.isError &&
            autocomplete.meta?.hasMore && (
              <div className="border-t border-border-subtle px-3 py-2 text-xs font-medium text-text-secondary">
                Mostrando {autocomplete.meta.returned} clientes. Continue
                digitando para refinar.
              </div>
            )}
        </PopoverContent>
      </Popover>

      {autocomplete.hasAppliedClient &&
        autocomplete.hasSearchValue &&
        autocomplete.hasMinimumSearchLength &&
        appliedHint}

      {autocomplete.hasSearchValue && statusMessage && !autocomplete.isOpen && (
        <p className={cn('mt-2 text-xs font-medium text-text-secondary', statusClassName)}>
          {statusMessage}
        </p>
      )}

      {footerHint}
    </div>
  );
}
