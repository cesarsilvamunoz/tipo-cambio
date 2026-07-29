'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './Header';
import CurrencyConverter from './CurrencyConverter';
import ConversionHistory from './ConversionHistory';
import TravelCheatSheet from './TravelCheatSheet';
import Footer from './Footer';
import SettingsModal, { type CustomRatesMap, loadStoredCustomRates } from './SettingsModal';
import { POPULAR_CURRENCIES } from '../_lib/data/currencies';
import type {
  Currency,
  ConversionHistoryItem,
  ActiveTab,
  ExchangeRatesData,
} from '../_lib/types';

const HISTORY_STORAGE_KEY = 'divisaexpert:conversion-history';
const HISTORY_MAX_ITEMS = 20;
const DEFAULT_FROM_CODE = 'CRC';
const FROM_CODE_STORAGE_KEY = 'divisaexpert:from-code';

function isConversionHistoryItem(value: unknown): value is ConversionHistoryItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.timestamp === 'string' &&
    typeof v.fromCode === 'string' &&
    typeof v.fromAmount === 'number' &&
    typeof v.toCode === 'string' &&
    typeof v.toAmount === 'number' &&
    typeof v.rate === 'number'
  );
}

function loadStoredHistory(): ConversionHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isConversionHistoryItem);
  } catch {
    return [];
  }
}

function loadStoredFromCode(fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(FROM_CODE_STORAGE_KEY);
    if (!raw) return fallback;
    return raw;
  } catch {
    return fallback;
  }
}

function formatTime(d: Date): string {
  const hour = String(d.getUTCHours()).padStart(2, '0');
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

interface AppShellProps {
  referenceDate: string;
}

export default function AppShell({ referenceDate }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');
  const [currencies, setCurrencies] = useState<Currency[]>(POPULAR_CURRENCIES);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => formatTime(new Date(referenceDate)));
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const historyLoaded = useRef(false);
  const [fromCode, setFromCode] = useState<string>(DEFAULT_FROM_CODE);
  const fromCodeLoaded = useRef(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customRates, setCustomRates] = useState<CustomRatesMap>({});
  const customLoaded = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      setHistory(loadStoredHistory());
      historyLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setFromCode(loadStoredFromCode(DEFAULT_FROM_CODE));
      fromCodeLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setCustomRates(loadStoredCustomRates());
      customLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!historyLoaded.current) return;
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      return undefined;
    }
  }, [history]);

  useEffect(() => {
    if (!customLoaded.current) return;
    try {
      window.localStorage.setItem('divisaexpert:custom-rates', JSON.stringify(customRates));
    } catch {
      return undefined;
    }
  }, [customRates]);

  useEffect(() => {
    if (!fromCodeLoaded.current) return;
    try {
      window.localStorage.setItem(FROM_CODE_STORAGE_KEY, fromCode);
    } catch {
      return undefined;
    }
  }, [fromCode]);

  const effectiveCurrencies = useMemo<Currency[]>(() => {
    const overrides = customRates;
    return currencies.map((c) => {
      const entry = overrides[c.code];
      if (entry && entry.enabled && Number.isFinite(entry.rate) && entry.rate > 0) {
        return { ...c, rateVsUSD: entry.rate };
      }
      return c;
    });
  }, [currencies, customRates]);

  const fetchLiveRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/rates', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as ExchangeRatesData;
      if (data && data.rates && typeof data.rates === 'object') {
        setCurrencies((prev) =>
          prev.map((c) => {
            const liveRate = data.rates[c.code];
            if (typeof liveRate === 'number' && Number.isFinite(liveRate)) {
              return { ...c, rateVsUSD: liveRate };
            }
            return c;
          })
        );
        setLastUpdated(formatTime(new Date()));
      }
    } catch {
      return;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchLiveRates());
  }, [fetchLiveRates]);

  const handleAddHistory = useCallback((item: ConversionHistoryItem) => {
    setHistory((prev) => [item, ...prev].slice(0, HISTORY_MAX_ITEMS));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleSelectFromCode = useCallback((code: string) => {
    setFromCode(code);
  }, []);

  const handleChangeCustomRate = useCallback(
    (code: string, rate: number, enabled: boolean) => {
      setCustomRates((prev) => ({ ...prev, [code]: { rate, enabled } }));
    },
    []
  );

  const handleResetCustomRate = useCallback((code: string) => {
    setCustomRates((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  }, []);

  const handleResetAllCustomRates = useCallback(() => {
    setCustomRates({});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-slate-900 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={handleOpenSettings}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'converter' && (
          <div className="space-y-8 animate-fadeIn">
            <CurrencyConverter
              currencies={effectiveCurrencies}
              onAddHistory={handleAddHistory}
              fromCode={fromCode}
              onChangeFromCode={handleSelectFromCode}
            />
            <ConversionHistory history={history} onClearHistory={handleClearHistory} />
          </div>
        )}

        {activeTab === 'cheatsheet' && (
          <div className="animate-fadeIn">
            <TravelCheatSheet currencies={effectiveCurrencies} />
          </div>
        )}
      </main>

      <Footer
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefreshRates={fetchLiveRates}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        currencies={currencies}
        currentFromCode={fromCode}
        customRates={customRates}
        onClose={handleCloseSettings}
        onSelectFromCode={handleSelectFromCode}
        onChangeCustomRate={handleChangeCustomRate}
        onResetCustomRate={handleResetCustomRate}
        onResetAllCustomRates={handleResetAllCustomRates}
      />
    </div>
  );
}