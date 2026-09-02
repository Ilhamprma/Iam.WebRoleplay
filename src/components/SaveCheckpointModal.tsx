import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Trash2,
  Bookmark,
  FileDown,
  Clock,
  CheckCircle,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { Campaign, SaveCheckpoint } from '../types/campaign';

interface SaveCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onCreateCheckpoint: (name?: string) => void;
  onRestoreCheckpoint: (id: string) => void;
  onDeleteCheckpoint: (id: string) => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onManualSave: () => void;
}

export const SaveCheckpointModal: React.FC<SaveCheckpointModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onCreateCheckpoint,
  onRestoreCheckpoint,
  onDeleteCheckpoint,
  onExportMarkdown,
  onExportJson,
  onManualSave,
}) => {
  const [customName, setCustomName] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCheckpoint(customName.trim() || undefined);
    setCustomName('');
    triggerFeedback();
  };

  const triggerFeedback = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleQuickSave = () => {
    onManualSave();
    triggerFeedback();
  };

  const handleRestore = (id: string) => {
    if (window.confirm('Pulihkan cerita ke titik checkpoint ini? Progres terkini yang belum disimpan akan tertimpa.')) {
      onRestoreCheckpoint(id);
      setRestoredId(id);
      setTimeout(() => setRestoredId(null), 2500);
    }
  };

  const checkpoints = campaign.checkpoints || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d101a] p-6 shadow-2xl text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Simpan Progres & Titik Cerita (Checkpoints)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola titik simpan semesta {campaign.name} agar Anda dapat kembali kapan saja.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Save Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4">
          <div>
            <span className="text-xs font-bold block text-slate-900 dark:text-white">Penyimpanan Utama</span>
            <span className="text-[11px] text-slate-500">Tersinkronisasi otomatis di browser Anda.</span>
          </div>

          <button
            onClick={handleQuickSave}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition shadow-xs"
          >
            {savedFeedback ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Cepat</span>
              </>
            )}
          </button>
        </div>

        {/* Create Checkpoint Form */}
        <form onSubmit={handleCreate} className="space-y-2 mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Buat Titik Simpan Baru (Snapshot)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nama checkpoint (contoh: Sebelum Masuk Menara Bayangan)..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060810] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Snapshot</span>
            </button>
          </div>
        </form>

        {/* Checkpoint List */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 mb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
            Daftar Titik Simpan ({checkpoints.length}):
          </span>

          {checkpoints.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Belum ada checkpoint buatan. Klik tombol snapshot di atas untuk membuat.</p>
          ) : (
            checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{cp.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      {cp.phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(cp.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRestore(cp.id)}
                    className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-[11px] flex items-center gap-1 transition"
                    title="Pulihkan cerita ke titik ini"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{restoredId === cp.id ? 'Dipulihkan!' : 'Muat'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteCheckpoint(cp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition"
                    title="Hapus checkpoint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Export Worldbuilding & Progress Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium transition"
              title="Unduh seluruh catatan worldbuilding & lorebook sebagai file Markdown (.md)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Lorebook (.MD)</span>
            </button>

            <button
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium transition"
              title="Unduh seluruh data semesta dan percakapan sebagai file JSON"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Cadangan (.JSON)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
