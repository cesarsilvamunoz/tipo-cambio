'use client';

import { RefreshCw } from 'lucide-react';

interface FooterProps {
  lastUpdated: string;
  isRefreshing: boolean;
  onRefreshRates: () => void;
}

export default function Footer({ lastUpdated, isRefreshing, onRefreshRates }: FooterProps) {
  return (
    <footer className="mt-auto text-slate-600 text-xs py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"> */}
          {/* <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-slate-800 text-sm flex items-center justify-center md:justify-start gap-2">
              <span>DIVISA<span className="text-emerald-600">EXPERT</span> • Plataforma Digital de Cambio</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">SUGEF</span>
            </div>
            <p className="text-slate-500 max-w-2xl text-[11px]">
              Los tipos de cambio mostrados son referenciales del Banco Central de Costa Rica (BCCR) y entidades autorizadas. Cotizaciones en tiempo real para CRC, BRL, USD y divisas globales.
            </p>
          </div> */}

          {/* <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs">
              <Shield className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Seguridad Certificada BCCR
            </span>
            <span className="text-slate-400 text-[11px]">© 2026 BancaDivisa Digital Solutions S.A.</span>
          </div> */}
        {/* </div> */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <span className="text-slate-500 text-[11px]">
            Última actualización: <strong className="text-slate-700">{lastUpdated}</strong>
          </span>
          <button
            type="button"
            onClick={onRefreshRates}
            disabled={isRefreshing}
            aria-label="Actualizar cotización de monedas"
            title="Actualizar cotización"
            id="refresh-rates-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50 text-xs font-semibold"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}