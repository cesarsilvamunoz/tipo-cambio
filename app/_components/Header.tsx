'use client';

import {
  ArrowLeftRight,
  Table2,
  Globe,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { ActiveTab } from '../_lib/types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

const TABS: Array<{ id: ActiveTab; label: string; icon: typeof ArrowLeftRight }> = [
  { id: 'converter', label: 'Conversor', icon: ArrowLeftRight },
  { id: 'cheatsheet', label: 'Tabla', icon: Table2 },
];

export default function Header({
  activeTab,
  setActiveTab,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="bg-slate-900 text-white border-b-4 border-emerald-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 shadow-md shrink-0" aria-hidden="true">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate">
                TIPO DE <span className="text-emerald-400">CAMBIO</span>
              </h1>
              {/* <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider truncate">
                <span className="sm:hidden">Costa Rica · Brasil · Global</span>
                <span className="hidden sm:inline">Plataforma de Cambio Oficial · Costa Rica, Brasil &amp; Global</span>
              </p> */}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            id="open-settings-button"
            aria-label="Abrir configuración"
            aria-haspopup="dialog"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-lg text-sm font-bold whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="hidden sm:inline">Configuración</span>
          </button>
        </div>

        <nav
          className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-6 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800 pt-3"
          aria-label="Secciones principales"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                id={`tab-${tab.id}`}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}