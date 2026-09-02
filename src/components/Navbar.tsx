import React from 'react';
import {
  Compass,
  Swords,
  Settings,
  BookMarked,
  Cpu,
  Sun,
  Moon,
  Save,
} from 'lucide-react';
import { Campaign, ApiConfig } from '../types/campaign';

interface NavbarProps {
  campaign: Campaign;
  apiConfig: ApiConfig;
  onOpenSettings: () => void;
  onOpenCampaigns: () => void;
  onToggleCodex: () => void;
  isCodexOpen: boolean;
  onSwitchPhase: (phase: 'worldbuilding' | 'roleplay') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSaveModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  campaign,
  apiConfig,
  onOpenSettings,
  onOpenCampaigns,
  onToggleCodex,
  isCodexOpen,
  onSwitchPhase,
  theme,
  onToggleTheme,
  onOpenSaveModal,
}) => {
  const isSimulation = apiConfig.provider === 'simulation';
  const isDark = theme === 'dark';

  return (
    <header className="app-header sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#08090d]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] px-3 sm:px-5 lg:px-8 flex items-center justify-between transition-colors">
      {/* Brand & Active Universe Selector (Opens Story Portal) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCampaigns}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition text-left active:scale-95 group"
          title="Buka Portal Cerita: Buat Baru atau Lanjutkan Cerita"
        >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-mono text-xs font-bold shadow-xs">
            Æ
          </div>
          <div className="min-w-0 max-w-[120px] sm:max-w-[180px]">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {campaign.name || 'Semesta Baru'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono group-hover:text-slate-900 dark:group-hover:text-white transition">▾</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate leading-none">
              {campaign.lore.genre || 'Pilih Cerita'}
            </p>
          </div>
        </button>
      </div>

      {/* Phase Segmented Controller */}
      <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0f1118] border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <button
          onClick={() => onSwitchPhase('worldbuilding')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
            campaign.phase === 'worldbuilding'
              ? 'bg-white dark:bg-white/15 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">1. Worldbuilder</span>
          <span className="sm:hidden">Lore</span>
        </button>

        <button
          onClick={() => onSwitchPhase('roleplay')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
            campaign.phase === 'roleplay'
              ? 'bg-white dark:bg-white/15 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">2. Roleplay Arena</span>
          <span className="sm:hidden">Play</span>
        </button>
      </div>

      {/* Actions & Utilities */}
      <div className="flex items-center gap-1.5">
        {/* Model Indicator Pill */}
        <button
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 text-[11px] font-mono transition"
          title="Konfigurasi Model AI & API"
        >
          <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="truncate max-w-[110px]">{isSimulation ? 'Offline Simulator' : apiConfig.model}</span>
        </button>

        {/* Save & Checkpoints Button */}
        <button
          onClick={onOpenSaveModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-semibold transition"
          title="Simpan Progres & Titik Checkpoint"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simpan</span>
        </button>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Codex Toggle */}
        <button
          onClick={onToggleCodex}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
            isCodexOpen
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white'
              : 'bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
          title="Buka Catatan Dunia & Codex"
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Codex</span>
        </button>

        {/* Settings Icon Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          title="Pengaturan API"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
