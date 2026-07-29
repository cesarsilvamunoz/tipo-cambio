'use client';

import { useState } from 'react';
import { Table2, Copy, Check, Tag, Compass } from 'lucide-react';
import type { Currency } from '../_lib/types';
import { convertCurrency, copyToClipboard, formatCurrencyValue, formatNumber } from '../_lib/utils/currencyUtils';

interface TravelCheatSheetProps {
  currencies: Currency[];
}

export default function TravelCheatSheet({ currencies }: TravelCheatSheetProps) {
  const [baseCode, setBaseCode] = useState<string>('CRC');
  const [copied, setCopied] = useState<boolean>(false);

  const baseCurrency = currencies.find((c) => c.code === baseCode) || currencies[0];

  const targetCodes = ['BRL', 'USD', 'EUR', 'MXN'].filter((c) => c !== baseCode);

  const sampleAmounts = baseCode === 'CRC'
    ? [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000]
    : baseCode === 'BRL'
    ? [5, 10, 20, 50, 100, 200, 500, 1000]
    : [1, 5, 10, 20, 50, 100, 200, 500];

  const getContextNote = (amount: number, code: string): string => {
    if (code !== 'CRC') return '';
    if (amount === 500) return 'Botella de agua o boleto de autobús urbano';
    if (amount === 1000) return 'Café o merienda ligera';
    if (amount === 5000) return 'Almuerzo corriente (Casado costarricense)';
    if (amount === 10000) return 'Taxi / Viaje corto de Uber o entrada a parque';
    if (amount === 25000) return 'Cena para dos en restaurante casual';
    if (amount === 50000) return 'Noche de hospedaje en hotel medio';
    if (amount === 100000) return 'Excursión o tour guiado completo';
    return '';
  };

  const handleCopyTable = async () => {
    const lines: string[] = [`TABLA DE CONVERSIÓN RÁPIDA (${baseCurrency.code})`];
    sampleAmounts.forEach((amt) => {
      let line = `${baseCurrency.symbol}${formatNumber(amt)} ${baseCurrency.code} = `;
      targetCodes.forEach((tCode) => {
        const tCurr = currencies.find((c) => c.code === tCode);
        if (tCurr) {
          const val = convertCurrency(amt, baseCurrency.rateVsUSD, tCurr.rateVsUSD);
          line += `${formatCurrencyValue(val, tCurr.code, tCurr.symbol)} | `;
        }
      });
      lines.push(line);
    });

    await copyToClipboard(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Guía del Viajero
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-800 mt-2 flex items-center gap-2">
              <Table2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" aria-hidden="true" />
              Tabla de Equivalencias Rápidas
            </h2>
            <p className="text-xs text-slate-500 mt-1 hidden sm:block">
              Guía de referencia rápida de precios habituales para viajes entre Costa Rica, Brasil, EE.UU. y Europa.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyTable}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shadow-sm"
              aria-label="Copiar tabla de conversión rápida"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copiar Tabla</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <span className="block text-[11px] font-bold uppercase text-slate-500 mb-2">Moneda Base:</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Seleccionar moneda base">
            {['CRC', 'BRL', 'USD', 'EUR'].map((code) => {
              const curr = currencies.find((c) => c.code === code);
              if (!curr) return null;
              const isActive = baseCode === code;
              return (
                <button
                  type="button"
                  key={code}
                  onClick={() => setBaseCode(code)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                    isActive
                      ? 'bg-emerald-500 text-slate-900 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span aria-hidden="true">{curr.flag}</span>
                  <span>{curr.code}</span>
                  <span className="text-slate-400">({curr.symbol})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 font-bold bg-slate-200/50">
                  {baseCurrency.flag} {baseCurrency.name} ({baseCurrency.code})
                </th>
                {targetCodes.map((tCode) => {
                  const tCurr = currencies.find((c) => c.code === tCode);
                  if (!tCurr) return null;
                  return (
                    <th key={tCode} className="px-5 py-4 font-bold">
                      {tCurr.flag} {tCurr.name} ({tCurr.code})
                    </th>
                  );
                })}
                <th className="px-5 py-4 font-bold">Referencia / Uso Frecuente</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sampleAmounts.map((amt) => {
                const note = getContextNote(amt, baseCode);

                return (
                  <tr key={amt} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-black text-slate-800 text-base font-mono bg-slate-50">
                      {baseCurrency.symbol}
                      {formatNumber(amt)} {baseCurrency.code}
                    </td>

                    {targetCodes.map((tCode) => {
                      const tCurr = currencies.find((c) => c.code === tCode);
                      if (!tCurr) return null;
                      const converted = convertCurrency(
                        amt,
                        baseCurrency.rateVsUSD,
                        tCurr.rateVsUSD
                      );
                      const formatted = formatCurrencyValue(converted, tCurr.code, tCurr.symbol);

                      const isBrl = tCode === 'BRL';

                      return (
                        <td
                          key={tCode}
                          className={`px-5 py-4 font-mono font-bold text-sm ${
                            isBrl ? 'text-emerald-700 font-extrabold' : 'text-slate-800'
                          }`}
                        >
                          {formatted}
                        </td>
                      );
                    })}

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {note ? (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-medium">
                          <Tag className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
                          {note}
                        </span>
                      ) : (
                        <span className="text-slate-300" aria-hidden="true">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="md:hidden divide-y divide-slate-100" aria-label="Tabla de conversión rápida">
          {sampleAmounts.map((amt) => {
            const note = getContextNote(amt, baseCode);
            return (
              <li key={amt} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800 text-base font-mono">
                    {baseCurrency.symbol}
                    {formatNumber(amt)} {baseCurrency.code}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {targetCodes.map((tCode) => {
                    const tCurr = currencies.find((c) => c.code === tCode);
                    if (!tCurr) return null;
                    const converted = convertCurrency(amt, baseCurrency.rateVsUSD, tCurr.rateVsUSD);
                    const formatted = formatCurrencyValue(converted, tCurr.code, tCurr.symbol);
                    const isBrl = tCode === 'BRL';
                    return (
                      <div
                        key={tCode}
                        className="flex items-center justify-between text-[11px] bg-slate-50 rounded-md px-2.5 py-1.5 border border-slate-200"
                      >
                        <span className="flex items-center gap-1 font-bold text-slate-500 uppercase">
                          <span aria-hidden="true">{tCurr.flag}</span>
                          <span className="font-mono">{tCurr.code}</span>
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isBrl ? 'text-emerald-700 font-extrabold' : 'text-slate-800'
                          }`}
                        >
                          {formatted}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {note && (
                  <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-1">
                    <Tag className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{note}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 text-[11px] sm:text-xs text-slate-500 flex items-start gap-2">
          <Compass className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Sugerencia para viajeros:</strong> Guarde una captura de pantalla o copie esta tabla en sus notas antes de abordar.
          </span>
        </div>
      </div>
    </div>
  );
}