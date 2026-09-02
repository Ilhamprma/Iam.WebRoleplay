import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RefreshCw,
  Wand2,
  CheckCircle2,
  Info,
  Save,
  FileDown,
  Check,
  AlertCircle,
  Cpu,
  Settings,
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

const PREMISE_SEEDS = [
  {
    title: 'Eldritch Mystery (1920s)',
    prompt:
      'Saya ingin latar cerita horor investigasi kosmis di kota pelabuhan berkabut tahun 1920-an. Saya berperan sebagai seorang detektif swasta yang baru menerima surat wasiat misterius.',
  },
  {
    title: 'Cyberpunk Neo-Jakarta (2088)',
    prompt:
      'Saya ingin dunia distopia cyberpunk berlatar di megacity Neo-Jakarta tahun 2088 di mana korporasi raksasa menguasai modifikasi sibernetik. Karakter saya adalah mantan peretas jaringan gelap.',
  },
  {
    title: 'Dark Fantasy High-Grim',
    prompt:
      'Saya ingin latar kerajaan fantasi gelap yang hancur setelah gerhana abadi terjadi. Sihir membutuhkan penyerapan darah atau jiwa, dan saya adalah ksatria pengelana yang mencari relik suci.',
  },
  {
    title: 'Sci-Fi Deep Frontier',
    prompt:
      'Saya ingin latar penjelajahan luar angkasa di batas galaksi tak terpetakan. Pesawat koloni kami mengalami kerusakan sistem navigasi darurat dan terdampar di orbit planet asing.',
  },
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
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-4xl mx-auto w-full px-4 py-4">
      {/* Intro Header */}
      {!hasStarted ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 max-w-2xl mx-auto py-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-slate-200">
            <Wand2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Rancang Semesta Roleplay Anda
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
              Diskusikan konsep dunia, aturan sihir atau teknologi, faksi penguasa, dan peran karakter Anda bersama AI World Architect sebelum memulai cerita.
            </p>
          </div>

          {/* Quick Seeds */}
          <div className="w-full space-y-2 text-left pt-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-1">
              Inspirasi Premis Instan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREMISE_SEEDS.map((seed, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(seed.prompt)}
                  className="p-3 rounded-xl bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-left transition group shadow-xs"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white block mb-1">
                    {seed.title}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {seed.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Transcript */
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 p-4 rounded-xl bg-white dark:bg-[#090b10] border border-slate-200 dark:border-white/[0.06] shadow-xs">
          {campaign.worldbuildingMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 text-xs font-mono font-bold">
                    WA
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-xl p-3.5 text-xs md:text-sm leading-relaxed border ${
                    isUser
                      ? 'bg-slate-900 text-white dark:bg-[#151822] dark:border-white/10 rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-[#0e1118] dark:border-white/[0.06] dark:text-slate-300 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 dark:text-slate-400 text-xs font-mono">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>World Architect sedang merumuskan hukum dunia...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Save Worldbuilding & Lock Lore Toolbar */}
      {hasStarted && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 my-2 rounded-xl bg-slate-100 dark:bg-[#0e1118] border border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              title="Simpan draf worldbuilding ke penyimpanan browser"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Draf Tersimpan!</span>
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
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              title="Unduh seluruh catatan worldbuilding & lorebook sebagai file Markdown (.md)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Ekspor Lorebook (.MD)</span>
            </button>
          </div>

          <button
            onClick={handleLockLore}
            disabled={isExtracting || isLoading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0 shadow-xs ml-auto"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyusun Codex...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kunci Lore & Mainkan &rarr;</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Descriptive Error Diagnosis Banner with 1-Click Recovery */}
      {error && (
        <div className="p-3.5 mb-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-red-500/20 text-[11px]">
            {onSwitchToSimulator && (
              <button
                type="button"
                onClick={handleSwitchSimulatorAndClear}
                className="px-2.5 py-1 rounded-md bg-red-600 text-white dark:bg-white dark:text-slate-950 font-bold flex items-center gap-1 hover:opacity-90 transition"
              >
                <Cpu className="w-3 h-3" />
                <span>Aktifkan Simulator Offline (Tanpa API Key)</span>
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
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            hasStarted
              ? 'Diskusikan detail lebih lanjut (geografi, faksi, kemampuan karakter)...'
              : 'Tuliskan ide tema cerita atau pilih salah satu inspirasi di atas...'
          }
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0c0e15] border border-slate-300 dark:border-white/10 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40 transition shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-semibold text-xs transition disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim</span>
        </button>
      </form>
    </div>
  );
};
