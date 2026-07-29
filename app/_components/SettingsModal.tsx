'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, Settings, X } from 'lucide-react';
import type { Currency } from '../_lib/types';

export interface CustomRate {
  rate: number;
  enabled: boolean;
}

export type CustomRatesMap = Record<string, CustomRate>;

interface SettingsModalProps {
  isOpen: boolean;
  currencies: Currency[];
  currentFromCode: string;
  customRates: CustomRatesMap;
  onClose: () => void;
  onSelectFromCode: (code: string) => void;
  onChangeCustomRate: (code: string, value: number, enabled: boolean) => void;
  onResetCustomRate: (code: string) => void;
  onResetAllCustomRates: () => void;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isCustomRatesMap(value: unknown): value is CustomRatesMap {
  if (typeof value !== 'object' || value === null) return false;
  const entries = Object.entries(value as Record<string, unknown>);
  return entries.every(([, entry]) => {
    if (typeof entry !== 'object' || entry === null) return false;
    const e = entry as Record<string, unknown>;
    return (
      typeof e.enabled === 'boolean' &&
      (typeof e.rate === 'number' || typeof e.rate === 'string')
    );
  });
}

function loadStoredCustomRates(): CustomRatesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('divisaexpert:custom-rates');
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isCustomRatesMap(parsed)) return {};
    const cleaned: CustomRatesMap = {};
    for (const [code, entry] of Object.entries(parsed)) {
      const rate = typeof entry.rate === 'number' ? entry.rate : parseFloat(entry.rate);
      if (isPositiveNumber(rate)) {
        cleaned[code] = { rate, enabled: entry.enabled };
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

export default function SettingsModal({
  isOpen,
  currencies,
  currentFromCode,
  customRates,
  onClose,
  onSelectFromCode,
  onChangeCustomRate,
  onResetCustomRate,
  onResetAllCustomRates,
}: SettingsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null;
    applyButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const filteredCurrencies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return currencies;
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term)
    );
  }, [currencies, search]);

  const customCount = useMemo(
    () => Object.values(customRates).filter((entry) => entry.enabled).length,
    [customRates]
  );

  if (!isOpen) return null;

  const handleChoose = (code: string) => {
    if (code !== currentFromCode) {
      onSelectFromCode(code);
    }
    onClose();
  };

  const handleRateInput = (code: string, raw: string) => {
    const parsed = parseFloat(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const existing = customRates[code];
    onChangeCustomRate(code, parsed, existing?.enabled ?? true);
  };

  const handleToggle = (code: string, enabled: boolean) => {
    const existing = customRates[code];
    const fallback = existing?.rate ?? currencies.find((c) => c.code === code)?.rateVsUSD ?? 1;
    onChangeCustomRate(code, fallback, enabled);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        aria-describedby="settings-modal-subtitle"
        className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 shrink-0 bg-slate-900 rounded-lg flex items-center justify-center"
              aria-hidden="true"
            >
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 id="settings-modal-title" className="text-lg font-bold text-slate-800">
                Configuración
              </h2>
              <p id="settings-modal-subtitle" className="text-xs text-slate-500 mt-0.5">
                Moneda base y tasas personalizadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar diálogo de configuración"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg shrink-0 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <section className="px-6 pt-5">
            <span className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
              Moneda de origen
            </span>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              role="radiogroup"
              aria-label="Seleccione la moneda de origen"
            >
              {currencies.map((curr) => {
                const isSelected = currentFromCode === curr.code;
                return (
                  <button
                    type="button"
                    key={curr.code}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleChoose(curr.code)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl" aria-hidden="true">
                        {curr.flag}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm leading-tight">{curr.code}</div>
                        <div
                          className={`text-[10px] truncate max-w-[90px] ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {curr.name}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-6 pt-6 pb-6 border-t border-slate-100 mt-5">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                Tipos de cambio personalizados
              </span>
              {customCount > 0 && (
                <button
                  type="button"
                  onClick={onResetAllCustomRates}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  Restablecer todos
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Defina un valor por 1 USD. Si lo activa, sobrescribe la tasa de la API al convertir.
            </p>

            <div className="relative mb-3">
              <input
                type="search"
                placeholder="Buscar moneda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar moneda para personalizar"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500"
              />
            </div>

            <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1" aria-label="Lista de monedas">
              {filteredCurrencies.map((curr) => {
                const entry = customRates[curr.code];
                const isCustom = Boolean(entry?.enabled);
                const rateValue = entry?.rate ?? curr.rateVsUSD;
                return (
                  <li
                    key={curr.code}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      isCustom ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-lg shrink-0" aria-hidden="true">{curr.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-800 leading-tight">
                        {curr.code} <span className="text-slate-400 font-medium">· {curr.symbol}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        1 USD = {curr.rateVsUSD} {curr.code}
                      </div>
                    </div>
                    <label className="flex items-center gap-1 shrink-0">
                      <span className="sr-only">{`Activar tasa personalizada para ${curr.code}`}</span>
                      <input
                        type="checkbox"
                        checked={isCustom}
                        onChange={(event) => handleToggle(curr.code, event.target.checked)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </label>
                    <div className="relative w-24 shrink-0">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={isCustom ? rateValue : ''}
                        placeholder={String(curr.rateVsUSD)}
                        onChange={(event) => handleRateInput(curr.code, event.target.value)}
                        disabled={!isCustom}
                        aria-label={`Tasa personalizada de ${curr.code} por 1 USD`}
                        className={`w-full text-right pr-1 pl-1 py-1 text-xs font-mono font-bold rounded border outline-none ${
                          isCustom
                            ? 'bg-white border-emerald-300 text-slate-800 focus:border-emerald-500'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => onResetCustomRate(curr.code)}
                        aria-label={`Restablecer tasa de ${curr.code}`}
                        title="Restablecer tasa"
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                );
              })}
              {filteredCurrencies.length === 0 && (
                <li className="text-center py-4 text-xs text-slate-500">
                  No se encontraron monedas.
                </li>
              )}
            </ul>
          </section>
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <span className="text-[11px] text-slate-500">
            {customCount > 0
              ? `${customCount} tasa${customCount === 1 ? '' : 's'} personalizada${customCount === 1 ? '' : 's'} activa${customCount === 1 ? '' : 's'}`
              : 'Sin tasas personalizadas'}
          </span>
          <button
            type="button"
            ref={applyButtonRef}
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

export { loadStoredCustomRates };