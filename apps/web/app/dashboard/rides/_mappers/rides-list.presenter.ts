import { parseApiError } from '@/lib/api-error';
import type { RideListScope, RideViewModel } from '@/types/rides';
import {
  groupRidesByDate,
  type RideDateGroup,
} from '../_lib/rides-list-groups';

export type RidesListContentState = 'loading' | 'error' | 'empty' | 'results';
export type RidesListEmptyStateVariant = 'default' | 'filtered';

export interface BuildRidesListPresenterParams {
  rides: RideViewModel[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage?: boolean;
  error?: unknown;
  hasActiveFilters: boolean;
  scope: RideListScope;
  now?: Date;
}

export interface RidesListPresentation {
  groupedRides: RideDateGroup[];
  scope: RideListScope;
  title: string;
  resultsLabel: string;
  contentState: RidesListContentState;
  emptyStateVariant: RidesListEmptyStateVariant;
  emptyTitle: string;
  emptyDescription: string;
  errorMessage: string | null;
}

function getResultsLabel(scope: RideListScope, totalCount: number, ridesCount: number) {
  const suffix = scope === 'archived' ? 'corridas arquivadas' : 'corridas';

  if (totalCount > ridesCount) {
    return `Mostrando ${ridesCount} de ${totalCount} ${suffix}`;
  }

  if (totalCount === 1) {
    return scope === 'archived' ? '1 corrida arquivada' : '1 corrida';
  }

  return `${totalCount} ${suffix}`;
}

function getEmptyCopy(scope: RideListScope, hasActiveFilters: boolean) {
  if (scope === 'archived') {
    return hasActiveFilters
      ? {
          title: 'Nenhuma corrida arquivada encontrada',
          description: 'Ajuste os filtros para ampliar a busca entre as arquivadas.',
        }
      : {
          title: 'Nenhuma corrida arquivada',
          description: 'As corridas arquivadas aparecerao aqui quando forem removidas da lista ativa.',
        };
  }

  return hasActiveFilters
    ? {
        title: 'Nenhuma corrida encontrada',
        description: 'Ajuste os filtros para ampliar a busca ou limpar o recorte atual.',
      }
    : {
        title: 'Nenhuma corrida registrada',
        description: 'As novas corridas aparecerao aqui assim que forem registradas.',
      };
}

export function buildRidesListPresenter({
  rides,
  totalCount,
  isLoading,
  isFetching,
  isFetchingNextPage = false,
  error,
  hasActiveFilters,
  scope,
  now,
}: BuildRidesListPresenterParams): RidesListPresentation {
  const groupedRides = groupRidesByDate(rides, now);
  const showLoadingState =
    (isLoading || (isFetching && rides.length === 0)) && !isFetchingNextPage;
  const emptyCopy = getEmptyCopy(scope, hasActiveFilters);

  let contentState: RidesListContentState = 'results';

  if (showLoadingState) {
    contentState = 'loading';
  } else if (error && rides.length === 0) {
    contentState = 'error';
  } else if (rides.length === 0 && !isFetching) {
    contentState = 'empty';
  }

  return {
    groupedRides,
    scope,
    title: scope === 'archived' ? 'Lista de corridas arquivadas' : 'Lista de corridas',
    resultsLabel: getResultsLabel(scope, totalCount, rides.length),
    contentState,
    emptyStateVariant: hasActiveFilters ? 'filtered' : 'default',
    emptyTitle: emptyCopy.title,
    emptyDescription: emptyCopy.description,
    errorMessage:
      contentState === 'error'
        ? parseApiError(
            error,
            scope === 'archived'
              ? 'Nao foi possivel carregar as corridas arquivadas agora.'
              : 'Nao foi possivel carregar o historico agora.',
          )
        : null,
  };
}
