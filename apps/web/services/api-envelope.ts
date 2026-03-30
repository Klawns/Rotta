export interface ApiEnvelope<TData, TMeta = Record<string, unknown>> {
  data: TData;
  meta: TMeta;
}

const EMPTY_META = {};

function isApiEnvelope<TData, TMeta>(
  payload: unknown,
): payload is ApiEnvelope<TData, TMeta> {
  return !!payload && typeof payload === 'object' && 'data' in payload;
}

export function unwrapData<TData>(payload: unknown): TData {
  if (isApiEnvelope<TData, Record<string, unknown>>(payload)) {
    return payload.data;
  }

  return payload as TData;
}

export function normalizeEnvelope<TData, TMeta = Record<string, unknown>>(
  payload: unknown,
  fallbackData: TData,
): ApiEnvelope<TData, TMeta> {
  if (isApiEnvelope<TData, TMeta>(payload)) {
    return {
      data: payload.data,
      meta: payload.meta ?? (EMPTY_META as TMeta),
    };
  }

  return {
    data: typeof payload === 'undefined' ? fallbackData : (payload as TData),
    meta: EMPTY_META as TMeta,
  };
}
