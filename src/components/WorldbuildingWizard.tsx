import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RefreshCw,
  Wand2,
  CheckCircle2,
  Save,
  FileDown,
  Check,
  AlertCircle,
  Cpu,
  Settings,
  Sparkles,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { Campaign, ApiConfig, WorldLore } from '../types/campaign';
import {
  sendChatMessage,
  buildWorldbuildingSystemPrompt,
  extractWorldCodexFromChat,
} from '../services/aiService';

interface WorldbuildingWizardProps {
  campaign: Campaign;
  apiConfig: ApiConfig;
  onAddMessage: (message: { sender: 'user' | 'assistant'; content: string }) => void;
  onLockLoreAndPlay: (extractedLore?: Partial<WorldLore>) => void;
  onSaveProgress: () => void;
  onExportMarkdown: () => void;
  onOpenSettings?: () => void;
  onSwitchToSimulator?: () => void;
}

const GENRE_RECOMMENDATIONS = [
  {
    id: 'fantasy',
    label: 'High Fantasy',
    icon: '🏰',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre fantasy tinggi dengan pulau langit terapung, sistem sihir kristal resonansi, faksi akademi arkana vs serikat pemburu, serta peran karakter petualang.',
  },
  {
    id: 'dark-fantasy',
    label: 'Dark Grim Fantasy',
    icon: '🔮',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre dark fantasy gerhana abadi dengan kerajaan runtuh, sistem sihir kutukan darah, faksi ordo kelabu vs pemuja malam, dan peran ksatria terkutuk.',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk 2099',
    icon: '🌃',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre cyberpunk 2099 di megacity vertikal berhujan asam, teknologi neuro-sync dan blackwall AI, korporasi Omni-Corp vs geng jalanan, dan peran infiltrator.',
  },
  {
    id: 'scifi',
    label: 'Sci-Fi Frontier',
    icon: '🚀',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre Sci-Fi penjelajahan galaksi batas terjauh, anomali lubang cacing purba, faksi armada koloni vs aliansi alien, dan peran kapten kapal eksplorasi.',
  },
  {
    id: 'eldritch',
    label: 'Eldritch Mystery',
    icon: '🐙',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre Horor Investigasi Kosmis 1920-an di pelabuhan berkabut, artefak terlarang dewa laut purba, kultus rahasia, dan peran detektif swasta.',
  },
  {
    id: 'wuxia',
    label: 'Wuxia / Silat',
    icon: '⛩️',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre Wuxia/Xianxia persilatan kuno dengan kultivasi Qi, sekte pedang suci vs sekte racun terlarang, dan peran pendekar pedang kelana.',
  },
  {
    id: 'steampunk',
    label: 'Steampunk Victoria',
    icon: '⚙️',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre Steampunk Victorian dengan mesin uap raksasa, kapal udara zeppelin lapis baja, serikat alkemis mekanik, dan peran insinyur petualang.',
  },
  {
    id: 'postapoc',
    label: 'Post-Apocalypse',
    icon: '🏜️',
    prompt:
      'Berikan rekomendasi worldbuilding dari genre Post-Apocalypse padang pasir tandus pasca-bencana radiasi, konvoi pemulung scrap, benteng oasis terakhir, dan peran pengembara gurun.',
  },
];

const REVISION_PROMPTS = [
  'Buat suasana dan hukum dunia ini lebih gelap & penuh intrik (grimdark).',
  'Tambahkan faksi pemberontak rahasia yang melawan penguasa.',
  'Ubah sistem sihir/teknologinya agar memiliki harga atau batasan yang lebih berbahaya.',
  'Ganti peran karakter utama saya menjadi buronan misterius yang menyembunyikan identitasnya.',
  'Pindahkan titik awal petualangan ke sebuah reruntuhan kuil kuno yang baru saja ditemukan.',
];

export const WorldbuildingWizard: React.FC<WorldbuildingWizardProps> = ({
  campaign,
  apiConfig,
  onAddMessage,
  onLockLoreAndPlay,
  onSaveProgress,
  onExportMarkdown,
  onOpenSettings,
  onSwitchToSimulator,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [campaign.worldbuildingMessages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setError(null);

    onAddMessage({ sender: 'user', content: textToSend });

    const updatedMessages = [
      ...campaign.worldbuildingMessages,
      { id: `temp_${Date.now()}`, sender: 'user' as const, content: textToSend, timestamp: Date.now() },
    ];

    setIsLoading(true);
    try {
      const systemPrompt = buildWorldbuildingSystemPrompt();
      const reply = await sendChatMessage(updatedMessages, systemPrompt, apiConfig);
      onAddMessage({ sender: 'assistant', content: reply });
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke AI. Periksa konfigurasi API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    onSaveProgress();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleLockLore = async () => {
    if (campaign.worldbuildingMessages.length === 0) {
      onLockLoreAndPlay();
      return;
    }

    setIsExtracting(true);
    setError(null);
    try {
      const extracted = await extractWorldCodexFromChat(
        campaign.worldbuildingMessages,
        apiConfig
      );
      onLockLoreAndPlay(extracted);
    } catch (err: any) {
      console.warn('Fallback to standard transition:', err);
      onLockLoreAndPlay();
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSwitchSimulatorAndClear = () => {
    if (onSwitchToSimulator) {
      onSwitchToSimulator();
      setError(null);
    }
  };

  const hasStarted = campaign.worldbuildingMessages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] max-w-4xl mx-auto w-full px-2.5 sm:px-4 py-2 sm:py-3">
      {/* Quick Genre Recommendation Bar (Visible on both intro & ongoing discussion) */}
      <div className="mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2 px-1 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Rekomendasi Genre Cepat:</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            1-Klik untuk membuat cetak biru semesta & revisi bebas
          </span>
        </div>

        {/* Scrollable Horizontal Genre Carousel on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {GENRE_RECOMMENDATIONS.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => handleSend(genre.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c0e15] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold whitespace-nowrap shrink-0 transition shadow-xs disabled:opacity-50 active:scale-95"
            >
              <span>{genre.icon}</span>
              <span>{genre.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intro Screen or Conversation Feed */}
      {!hasStarted ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 max-w-2xl mx-auto py-4 px-2 overflow-y-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Wand2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Studio Desain Semesta Roleplay
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
              Pilih salah satu rekomendasi genre di atas atau tuliskan konsep kustom Anda. AI World Architect akan langsung menyusun hukum dunia, faksi, dan adegan pembuka yang dapat Anda revisi dengan leluasa.
            </p>
          </div>

          {/* Quick Start Cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
            {GENRE_RECOMMENDATIONS.slice(0, 4).map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleSend(genre.prompt)}
                disabled={isLoading}
                className="p-3 rounded-xl bg-white dark:bg-[#0c0e15] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-left transition group shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{genre.icon}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:underline">
                    {genre.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {genre.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation Transcript */
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 sm:pr-2 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#090b10] border border-slate-200 dark:border-white/[0.06] shadow-xs">
          {campaign.worldbuildingMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shrink-0 text-xs font-mono font-bold shadow-xs">
                    WA
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed border ${
                    isUser
                      ? 'bg-slate-900 text-white dark:bg-[#151822] dark:border-white/10 rounded-tr-none shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-[#0e1118] dark:border-white/[0.06] dark:text-slate-300 rounded-tl-none shadow-xs whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shrink-0 text-xs font-mono font-bold shadow-xs">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2 sm:gap-3 items-center text-slate-500 dark:text-slate-400 text-xs font-mono">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>World Architect sedang merumuskan semesta & rekomendasi...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Interactive Quick Revision Chips when user has started discussion */}
      {hasStarted && (
        <div className="pt-2 pb-1 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Revisi Cepat:
            </span>
            {REVISION_PROMPTS.map((rev, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(rev)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap shrink-0 transition"
              >
                + {rev}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Worldbuilding & Lock Lore Toolbar */}
      {hasStarted && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 my-1.5 rounded-xl bg-slate-100 dark:bg-[#0e1118] border border-slate-200 dark:border-white/[0.08] shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveDraft}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              title="Simpan draf worldbuilding ke penyimpanan browser"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Draf</span>
                </>
              )}
            </button>

            <button
              onClick={onExportMarkdown}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              title="Unduh seluruh catatan worldbuilding & lorebook sebagai file Markdown (.md)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor Lorebook (.MD)</span>
              <span className="sm:hidden">Ekspor .MD</span>
            </button>
          </div>

          <button
            onClick={handleLockLore}
            disabled={isExtracting || isLoading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0 shadow-xs ml-auto active:scale-95"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyusun Codex...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-600" />
                <span>Kunci Lore & Masuk Roleplay &rarr;</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Descriptive Error Diagnosis Banner with 1-Click Recovery */}
      {error && (
        <div className="p-3 mb-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs space-y-2 shrink-0">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/20 text-[11px]">
            {onSwitchToSimulator && (
              <button
                type="button"
                onClick={handleSwitchSimulatorAndClear}
                className="px-2.5 py-1 rounded-md bg-red-600 text-white dark:bg-white dark:text-slate-950 font-bold flex items-center gap-1 hover:opacity-90 transition"
              >
                <Cpu className="w-3 h-3" />
                <span>Beralih ke Simulator Offline</span>
              </button>
            )}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold flex items-center gap-1 transition"
              >
                <Settings className="w-3 h-3" />
                <span>Buka Pengaturan API</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-1.5 sm:gap-2 pt-1 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            hasStarted
              ? 'Minta revisi (misal: "tambah naga kuno", "ubah sistem sihir")...'
              : 'Tulis ide tema Anda atau klik tombol genre rekomendasi di atas...'
          }
          disabled={isLoading}
          className="flex-1 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-[#0c0e15] border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40 transition shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-semibold text-xs sm:text-sm transition disabled:opacity-40 flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
