'use client';

import { Timeline, Trash2, ArrowRight, Clock } from 'lucide-react';
import { formatCurrencyValue } from '../_lib/utils/currencyUtils';
import type { ConversionHistoryItem } from '../_lib/types';

interface ConversionHistoryProps {
  history: ConversionHistoryItem[];
  onClearHistory: () => void;
}

export default function ConversionHistory({ history, onClearHistory }: ConversionHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Timeline className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          Historial Reciente de Conversiones
        </h3>
        <button
          type="button"
          onClick={onClearHistory}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
          title="Borrar historial"
          aria-label="Borrar historial de conversiones"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                {item.timestamp}
              </span>
              <span className="font-mono text-[10px] text-slate-500 font-semibold">
                Tasa: {item.rate.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
              <span>
                {formatCurrencyValue(item.fromAmount, item.fromCode, '')} {item.fromCode}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span className="text-emerald-700 font-extrabold">
                {formatCurrencyValue(item.toAmount, item.toCode, '')} {item.toCode}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}