import { FALLBACK_RATES } from '../../_lib/data/currencies';
import type { ExchangeRatesData } from '../../_lib/types';

export const dynamic = 'force-dynamic';

const UPSTREAM_URL = 'https://open.er-api.com/v6/latest/USD';
const FETCH_TIMEOUT_MS = 4000;

function buildFallback(): ExchangeRatesData {
  return {
    base: 'USD',
    date: new Date().toISOString(),
    timestamp: Date.now(),
    rates: FALLBACK_RATES,
    source: 'Internal Rate Engine',
  };
}

async function fetchUpstream(signal: AbortSignal): Promise<Response> {
  return fetch(UPSTREAM_URL, { signal, cache: 'no-store' });
}

export async function GET(): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const apiRes = await fetchUpstream(controller.signal);
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = (await apiRes.json()) as { rates?: Record<string, number>; time_last_update_utc?: string };
      if (data && data.rates && typeof data.rates === 'object') {
        const payload: ExchangeRatesData = {
          base: 'USD',
          date: data.time_last_update_utc || new Date().toISOString(),
          timestamp: Date.now(),
          rates: data.rates,
          source: 'Live Exchange API',
        };
        return Response.json(payload);
      }
    }
  } catch {
    clearTimeout(timeoutId);
  }

  return Response.json(buildFallback());
}