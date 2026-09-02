import React, { useState } from 'react';
import {
  X,
  Plus,
  Compass,
  Play,
  Clock,
  Trash2,
  Download,
  Upload,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Shield,
  MapPin,
  FileText,
} from 'lucide-react';
import { Campaign } from '../types/campaign';

interface StoryPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  activeCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onCreateCampaign: (name: string, genre?: string) => void;
  onDeleteCampaign: (id: string) => void;
  onExportCampaign: () => void;
  onImportCampaign: (jsonStr: string) => boolean;
}

const GENRE_TEMPLATES = [
  { label: 'High Fantasy', icon: '🏰', desc: 'Pulau langit melayang, sihir kristal, dan guild petualang.' },
  { label: 'Cyberpunk 2099', icon: '🌃', desc: 'Megacity futuristik, implan sibernetik, dan AI jaringan gelap.' },
  { label: 'Dark Grim Fantasy', icon: '🔮', desc: 'Kerajaan runtuh di bawah gerhana abadi dengan sihir kutukan.' },
  { label: 'Wuxia / Silat Kuno', icon: '⛩️', desc: 'Dunia persilatan, kultivasi energi Qi, dan sekte pedang legendaris.' },
  { label: 'Sci-Fi Deep Frontier', icon: '🚀', desc: 'Penjelajahan batas galaksi tak terpetakan dan anomali kosmis.' },
  { label: 'Eldritch Mystery', icon: '🐙', desc: 'Horor investigasi 1920-an di pelabuhan berkabut dan sekte purba.' },
];

export const StoryPortalModal: React.FC<StoryPortalModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onCreateCampaign,
  onDeleteCampaign,
  onExportCampaign,
  onImportCampaign,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'continue'>('continue');
  const [newTitle, setNewTitle] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('High Fantasy');
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateCampaign(newTitle.trim(), selectedGenre);
    setNewTitle('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = onImportCampaign(content);
      if (ok) {
        setImportError('');
        onClose();
      } else {
        setImportError('Berkas JSON tidak valid atau format rusak.');
      }
    };
    reader.readAsText(file);
  };

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] shadow-2xl text-slate-900 dark:text-white flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
              Æ
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Portal Petualangan Roleplay
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih untuk melanjutkan petualangan tersimpan atau merancang semesta baru.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: Buat Cerita Baru vs Lanjutkan Cerita */}
        <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-[#080a11] p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('continue')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'continue'
                ? 'bg-white dark:bg-white/15 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Lanjutkan Cerita ({campaigns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'create'
                ? 'bg-white dark:bg-white/15 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>+ Buat Cerita Baru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: LANJUTKAN CERITA */}
          {activeTab === 'continue' && (
            <div className="space-y-4">
              {/* Highlight Card for Active / Latest Campaign */}
              {activeCampaign && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white dark:bg-white/10 border border-slate-800 dark:border-white/15 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Cerita Terakhir Aktif
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {activeCampaign.phase === 'worldbuilding' ? 'Tahap: Desain Semesta' : 'Tahap: Dalam Roleplay'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold">{activeCampaign.name}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                      {activeCampaign.lore.summary || 'Petualangan kustom bersama AI Game Master.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeCampaign.player.name} ({activeCampaign.player.role})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeCampaign.lore.currentLocation || 'Titik Permulaan'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectCampaign(activeCampaign.id);
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-white text-slate-950 dark:bg-white dark:text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition shadow-sm active:scale-[0.99]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Lanjutkan Petualangan Ini &rarr;</span>
                  </button>
                </div>
              )}

              {/* List of All Other Saved Campaigns */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
                  Semua Petualangan Tersimpan:
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {campaigns.map((camp) => {
                    const isSelected = camp.id === activeCampaignId;
                    return (
                      <div
                        key={camp.id}
                        onClick={() => {
                          onSelectCampaign(camp.id);
                          onClose();
                        }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-white/15 border-slate-900 dark:border-white text-slate-950 dark:text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm truncate">{camp.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-mono bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 shrink-0">
                              {camp.lore.genre || 'Kustom'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {camp.lore.currentLocation ? `📍 ${camp.lore.currentLocation}` : 'Dunia Baru'} &bull; {camp.player.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>Tersimpan: {new Date(camp.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1" />}
                          {campaigns.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteCampaign(camp.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition"
                              title="Hapus Cerita Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Backup and Import Tools */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={onExportCampaign}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Cadangkan File Cerita (.JSON)</span>
                </button>

                <label className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor Cerita (.JSON)</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {importError && (
                <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  {importError}
                </p>
              )}
            </div>
          )}

          {/* TAB 2: BUAT CERITA BARU */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Judul Petualangan / Nama Semesta:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Takhta Langit Aethelgard, Neo-Jakarta 2099, Misteri Lembah Kelabu..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060810] border border-slate-300 dark:border-white/15 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Pilih Genre / Tema Dunia:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GENRE_TEMPLATES.map((tmpl) => {
                    const isPicked = selectedGenre === tmpl.label;
                    return (
                      <button
                        key={tmpl.label}
                        type="button"
                        onClick={() => setSelectedGenre(tmpl.label)}
                        className={`p-3 rounded-xl border text-left transition ${
                          isPicked
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                            : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{tmpl.icon}</span>
                          <span className="text-xs font-bold">{tmpl.label}</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${isPicked ? 'text-slate-200 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                          {tmpl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('continue')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Kembali ke Daftar
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-extrabold text-xs sm:text-sm transition disabled:opacity-40 flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Rancang Cerita &rarr;</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
