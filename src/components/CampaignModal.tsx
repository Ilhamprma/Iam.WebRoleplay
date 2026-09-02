import React, { useState } from 'react';
import { X, Plus, Download, Upload, Trash2, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { Campaign } from '../types/campaign';

interface CampaignModalProps {
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

export const CampaignModal: React.FC<CampaignModalProps> = ({
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
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateCampaign(newTitle.trim(), newGenre.trim() || undefined);
    setNewTitle('');
    setNewGenre('');
    setIsCreating(false);
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
        setImportError('File JSON tidak valid atau format kampanye rusak.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d101a] p-6 shadow-2xl text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Semesta & Kampanye Cerita</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pilih, buat semesta baru, atau cadangkan petualangan Anda.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign List */}
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {campaigns.map((camp) => {
            const isActive = camp.id === activeCampaignId;
            return (
              <div
                key={camp.id}
                onClick={() => {
                  onSelectCampaign(camp.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  isActive
                    ? 'bg-slate-100 dark:bg-white/10 border-slate-900 dark:border-white text-slate-950 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{camp.name}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full uppercase font-mono bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-300"
                    >
                      {camp.phase === 'worldbuilding' ? 'Worldbuilding' : 'In Roleplay'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                    {camp.lore.genre || 'Kustom'} — {camp.lore.summary || 'Belum ada ringkasan'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Terakhir aktif: {new Date(camp.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-white mr-2" />}
                  <button
                    onClick={() => onDeleteCampaign(camp.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition"
                    title="Hapus Semesta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Creation Form */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Inisialisasi Semesta Baru</h3>
            <input
              type="text"
              placeholder="Nama Semesta / Judul Cerita (e.g. Kerajaan Aethelgard)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#060810] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40"
              autoFocus
              required
            />
            <input
              type="text"
              placeholder="Tema / Genre Awal (e.g. Dark Fantasy / Cyberpunk)"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#060810] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold transition"
              >
                Buat Sekarang
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-slate-600 dark:hover:border-white/40 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Buat Semesta / Petualangan Baru
          </button>
        )}

        {/* Error message */}
        {importError && <p className="text-xs text-red-500 mt-2">{importError}</p>}

        {/* Export / Import Bar */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-200 dark:border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCampaign}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition"
              title="Unduh data kampanye aktif sebagai JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              Import JSON
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <button onClick={onClose} className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
