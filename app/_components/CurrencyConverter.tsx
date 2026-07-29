'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpDown, Plus, Copy, Check, X, Search, GripVertical } from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Currency, ConversionHistoryItem } from '../_lib/types';
import { convertCurrency, copyToClipboard, formatCurrencyValue, formatNumber, getDirectRate } from '../_lib/utils/currencyUtils';
import { PRESET_AMOUNTS } from '../_lib/data/currencies';

interface CurrencyConverterProps {
  currencies: Currency[];
  onAddHistory: (item: ConversionHistoryItem) => void;
  fromCode?: string;
  onChangeFromCode?: (code: string) => void;
}

const ORDER_STORAGE_KEY = 'divisaexpert:equivalencias-order';
const AMOUNT_STORAGE_KEY = 'divisaexpert:amount';
const DEFAULT_FROM_CODE = 'CRC';
const DEFAULT_TARGET_CODES = ['BRL', 'USD', 'EUR', 'MXN', 'COP'];
const DEFAULT_AMOUNT = 0;

function isStringArray(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => typeof item === 'string' && item.length > 0);
}

function loadStoredOrder(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStringArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function loadStoredAmount(fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(AMOUNT_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

interface SortableItemProps {
  id: string;
  children: ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`relative rounded-xl border bg-white pl-10 pr-3 py-4 shadow-md transition-all hover:shadow-lg ${
          isDragging ? 'ring-2 ring-emerald-400' : ''
        }`}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label="Mover tarjeta"
          aria-roledescription="Ordenable"
          title="Arrastre para reordenar"
          className="absolute top-3 left-2 z-10 p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <GripVertical className="w-4 h-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function CurrencyConverter({
  currencies,
  onAddHistory,
  fromCode,
  onChangeFromCode,
}: CurrencyConverterProps) {
  const [internalFromCode, setInternalFromCode] = useState<string>(DEFAULT_FROM_CODE);
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);
  const [targetCodes, setTargetCodes] = useState<string[]>(DEFAULT_TARGET_CODES);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isFromCodeControlled = typeof fromCode === 'string' && typeof onChangeFromCode === 'function';
  const activeFromCode = isFromCodeControlled ? fromCode : internalFromCode;

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const orderLoaded = useRef(false);
  const amountLoaded = useRef(false);

  const fromCurrency = currencies.find((c) => c.code === activeFromCode) || currencies[0];

  const updateFromCode = (code: string) => {
    if (isFromCodeControlled) {
      onChangeFromCode?.(code);
    } else {
      setInternalFromCode(code);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      setTargetCodes((prev) =>
        prev.includes(activeFromCode) ? prev.filter((c) => c !== activeFromCode) : prev
      );
    });
  }, [activeFromCode]);

  useEffect(() => {
    if (orderLoaded.current) return;
    const stored = loadStoredOrder();
    queueMicrotask(() => {
      if (stored) {
        const knownCodes = new Set(currencies.map((c) => c.code));
        const filtered = stored.filter((code) => knownCodes.has(code));
        if (filtered.length > 0) {
          setTargetCodes(filtered);
        }
      }
      orderLoaded.current = true;
    });
  }, [currencies]);

  useEffect(() => {
    if (amountLoaded.current) return;
    queueMicrotask(() => {
      setAmount(loadStoredAmount(DEFAULT_AMOUNT));
      amountLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!orderLoaded.current) return;
    try {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(targetCodes));
    } catch {
      return;
    }
  }, [targetCodes]);

  useEffect(() => {
    if (!amountLoaded.current) return;
    try {
      window.localStorage.setItem(AMOUNT_STORAGE_KEY, String(amount));
    } catch {
      return;
    }
  }, [amount]);

  useEffect(() => {
    if (!isAddCurrencyOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddCurrencyOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      previouslyFocused?.focus();
    };
  }, [isAddCurrencyOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(event.target.value);
    setAmount(isNaN(val) ? 0 : val);
  };

  const handleSwap = (targetCode: string) => {
    const previousFromCode = activeFromCode;
    updateFromCode(targetCode);
    setTargetCodes((prev) => prev.map((code) => (code === targetCode ? previousFromCode : code)));
  };

  const handleCopyResult = async (code: string, valueStr: string) => {
    await copyToClipboard(valueStr);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);

    const targetCurr = currencies.find((c) => c.code === code);
    if (targetCurr) {
      const convertedVal = convertCurrency(
        amount,
        fromCurrency.rateVsUSD,
        targetCurr.rateVsUSD
      );
      onAddHistory({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
        fromCode: fromCurrency.code,
        fromAmount: amount,
        toCode: targetCurr.code,
        toAmount: convertedVal,
        rate: getDirectRate(fromCurrency.rateVsUSD, targetCurr.rateVsUSD),
      });
    }
  };

  const handleAddTargetCurrency = (code: string) => {
    if (!targetCodes.includes(code) && code !== activeFromCode) {
      setTargetCodes([...targetCodes, code]);
    }
    setIsAddCurrencyOpen(false);
  };

  const handleRemoveTargetCurrency = (code: string) => {
    if (targetCodes.length > 1) {
      setTargetCodes(targetCodes.filter((c) => c !== code));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTargetCodes((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const presets = PRESET_AMOUNTS[activeFromCode] || PRESET_AMOUNTS.DEFAULT;

  const filteredAvailableCurrencies = currencies.filter(
    (c) =>
      c.code !== activeFromCode &&
      !targetCodes.includes(c.code) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 sm:px-8 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
          <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Calculadora de Conversión
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800 mt-2 flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{fromCurrency.flag}</span>
            Conversor de {fromCurrency.name}
            <span className="font-mono text-slate-400 font-bold text-sm">({fromCurrency.code})</span>
          </h2>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 lg:max-w-xl">
            <label htmlFor="amount-input" className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
              Cantidad a convertir
            </label>
            <div className="flex items-stretch gap-1.5 bg-slate-50 border border-slate-200 rounded-md focus-within:border-emerald-500 transition-colors overflow-hidden">
              <div className="flex items-center px-3 bg-white border-r border-slate-200 shrink-0">
                <span className="text-sm font-bold text-slate-700" aria-hidden="true">{fromCurrency.symbol}</span>
              </div>
              <input
                type="number"
                value={amount === 0 ? '' : amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                id="amount-input"
                aria-label={`Cantidad a convertir en ${fromCurrency.name}`}
                className="bg-transparent text-lg sm:text-xl font-bold text-slate-800 focus:outline-none py-2 w-full min-w-0"
              />
              <div className="hidden md:flex items-center gap-1 px-2.5 bg-white border-l border-slate-200 shrink-0">
                <span className="text-sm" aria-hidden="true">{fromCurrency.flag}</span>
                <span className="font-bold text-slate-700 text-[11px] font-mono">{fromCurrency.code}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Preajustes:</span>
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  aria-pressed={amount === preset}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors font-mono ${
                    amount === preset
                      ? 'bg-emerald-500 text-slate-900 border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fromCurrency.symbol}{formatNumber(preset)}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-slate-100 lg:pl-5">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
              Equivalencia rápida
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(targetCodes.slice(0, 4)).map((code) => {
                const targetCurr = currencies.find((c) => c.code === code);
                if (!targetCurr) return null;
                const value = convertCurrency(amount, fromCurrency.rateVsUSD, targetCurr.rateVsUSD);
                const formatted = formatCurrencyValue(value, targetCurr.code, targetCurr.symbol);
                const isHighlight = code === 'BRL';
                return (
                  <div
                    key={code}
                    className={`p-2 rounded-md border ${
                      isHighlight
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      <span aria-hidden="true">{targetCurr.flag}</span>
                      <span className="font-mono">{targetCurr.code}</span>
                    </div>
                    <div className={`text-sm sm:text-base font-black font-mono tracking-tight mt-0.5 truncate ${
                      isHighlight ? 'text-emerald-700' : 'text-slate-800'
                    }`}>
                      {formatted}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Equivalencias en Múltiples Monedas
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {targetCodes.length} Activas
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Conversión en tiempo real ajustada por tipo de cambio interbancario
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddCurrencyOpen(true)}
            id="add-currency-button"
            aria-haspopup="dialog"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            Añadir Moneda al Panel
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
          <SortableContext items={targetCodes} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {targetCodes.map((code) => {
                const targetCurr = currencies.find((c) => c.code === code);
                if (!targetCurr) return null;

                const convertedValue = convertCurrency(
                  amount,
                  fromCurrency.rateVsUSD,
                  targetCurr.rateVsUSD
                );

                const directRate = getDirectRate(fromCurrency.rateVsUSD, targetCurr.rateVsUSD);
                const reverseRate = getDirectRate(targetCurr.rateVsUSD, fromCurrency.rateVsUSD);

                const formattedVal = formatCurrencyValue(convertedValue, targetCurr.code, targetCurr.symbol);

                const isBrl = code === 'BRL';
                const isUsd = code === 'USD';

                return (
                  <SortableItem key={code} id={code}>
                    {isBrl && (
                      <span className="absolute top-3 right-10 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                        Real Brasileño
                      </span>
                    )}
                    {isUsd && (
                      <span className="absolute top-3 right-10 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded-full">
                        Dólar US
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveTargetCurrency(code)}
                      className="absolute top-3 right-2 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors z-10"
                      title="Eliminar de la vista"
                      aria-label={`Eliminar ${targetCurr.name} del panel`}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl" aria-hidden="true">{targetCurr.flag}</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base leading-tight">
                          {targetCurr.name}
                        </h4>
                        <span className="text-xs font-bold text-emerald-600">
                          {targetCurr.code} ({targetCurr.country})
                        </span>
                      </div>
                    </div>

                    <div className="my-4 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xl font-black text-slate-800 tracking-tight truncate">
                          {formattedVal}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                          De {fromCurrency.symbol}{formatNumber(amount)} {fromCurrency.code}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyResult(code, formattedVal)}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shrink-0 shadow-sm"
                        title="Copiar resultado"
                        aria-label={`Copiar resultado de conversión a ${targetCurr.name}`}
                      >
                        {copiedCode === code ? (
                          <Check className="w-4 h-4 text-emerald-600 animate-bounce" aria-hidden="true" />
                        ) : (
                          <Copy className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <div className="space-y-0.5">
                        <div>
                          1 {fromCurrency.code} = <span className="text-slate-800 font-mono font-bold">{directRate.toFixed(4)} {targetCurr.code}</span>
                        </div>
                        <div>
                          1 {targetCurr.code} = <span className="text-slate-800 font-mono font-bold">{reverseRate.toFixed(2)} {fromCurrency.code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSwap(code)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-900 text-white transition-all flex items-center gap-1 text-[11px] font-bold"
                          title={`Invertir orden: Convertir desde ${targetCurr.code}`}
                          aria-label={`Invertir orden: convertir desde ${targetCurr.code}`}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                          Invertir
                        </button>
                      </div>
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {isAddCurrencyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-currency-title"
            className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 id="add-currency-title" className="text-lg font-bold text-slate-800">Añadir Moneda al Panel</h3>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={() => setIsAddCurrencyOpen(false)}
                aria-label="Cerrar diálogo"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar por país, nombre o código (ej. EUR, Chile)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar moneda"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredAvailableCurrencies.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">
                  No se encontraron más monedas disponibles.
                </div>
              ) : (
                filteredAvailableCurrencies.map((curr) => (
                  <button
                    type="button"
                    key={curr.code}
                    onClick={() => handleAddTargetCurrency(curr.code)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 text-left transition-colors border border-transparent hover:border-slate-200"
                    aria-label={`Añadir ${curr.name} al panel`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">{curr.flag}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-800">{curr.name}</div>
                        <div className="text-xs text-slate-500">
                          {curr.code} • {curr.country}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded" aria-hidden="true">
                      {curr.symbol}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}