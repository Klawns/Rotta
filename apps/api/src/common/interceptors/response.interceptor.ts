/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents -- Response normalization handles heterogeneous controller payloads at runtime. */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

function hasStructuredMetadata(metadata: Record<string, unknown>) {
  return Object.values(metadata).some(
    (value) =>
      !!value &&
      typeof value === 'object' &&
      !(value instanceof Date) &&
      !Array.isArray(value),
  );
}

/**
 * Interceptor global de resposta para padronização V2.
 * Garante o formato { data: T, meta: { ... } }.
 *
 * Lógica de Normalização:
 * 1. Identifica o conteúdo real (unwrap de chaves 'clients', 'rides', etc).
 * 2. Envelopa no padrão { data, meta }.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | any> {
    return next.handle().pipe(
      map((result) => {
        // Se não houver resultado, retorna o padrão vazio
        if (!result) return { data: null, meta: {} };

        let finalData = result;
        let finalMeta = {};

        // 1. Extração de Metadados e Dados (Unwrapping de objetos Drizzle/Legados)
        if (typeof result === 'object' && !Array.isArray(result)) {
          // Se o resultado já veio no envelope { data, meta }
          if ('data' in result) {
            finalData = result.data;
            finalMeta = result.meta || {};
          }

          // Se ainda houver aninhamento interno (ex: data: { clients: [...] } ou result: { clients: [...] })
          if (
            finalData &&
            typeof finalData === 'object' &&
            !Array.isArray(finalData)
          ) {
            const { clients, rides, items, ...rest } = finalData;
            const collectionData = clients || rides || items;

            if (
              collectionData !== undefined &&
              !hasStructuredMetadata(rest as Record<string, unknown>)
            ) {
              finalData = collectionData;
              finalMeta = { ...finalMeta, ...rest };
            }
          }
        }

        // 2. Formatação Final V2
        return {
          data: finalData,
          meta: finalMeta,
        };
      }),
    );
  }
}
