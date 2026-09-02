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
  Copy,
  ArrowRight,
  BookOpen,
  MapPin,
  Shield,
  Scroll,
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
  onOpenCodex?: () => void;
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
  { label: 'Suasana grimdark', prompt: 'Buat suasana & hukum dunia ini lebih gelap (grimdark)' },
  { label: 'Faksi pemberontak', prompt: 'Tambahkan faksi pemberontak rahasia yang melawan penguasa' },
  { label: 'Batasan sistem', prompt: 'Ubah sistem sihir/teknologinya agar memiliki batasan berbahaya' },
  { label: 'Peran karakter', prompt: 'Jadikan karakter utama buronan misterius' },
  { label: 'Lokasi awal', prompt: 'Pindahkan titik awal petualangan ke reruntuhan kuno' },
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
  onOpenCodex,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
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
    <div className="workspace flex-1 flex flex-col h-[calc(100dvh-60px)] w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 overflow-hidden">
      {/* Quick Genre Recommendation Carousel */}
      <div className="mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2 px-1 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Preset Genre Cepat:</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Klik salah satu genre untuk menghasilkan cetak biru semesta secara instan
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {GENRE_RECOMMENDATIONS.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => handleSend(genre.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e121d] hover:bg-slate-100 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 text-slate-800 dark:text-slate-200 text-xs font-semibold whitespace-nowrap shrink-0 transition shadow-xs disabled:opacity-50 active:scale-95"
            >
              <span>{genre.icon}</span>
              <span>{genre.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Area: Split on Desktop (Chat on Left, Live Lore Blueprint on Right) */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Chat Conversation */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Intro Screen or Conversation Feed */}
          {!hasStarted ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 max-w-2xl mx-auto py-3 px-2 overflow-y-auto">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 text-white flex items-center justify-center font-bold shadow-xl shadow-indigo-500/20">
                <Wand2 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20">
                  AI World Architect & Lore Studio
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                  Rancang Semesta & Hukum Cerita Anda
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Pilih cetak biru genre di atas atau tuliskan ide konsep Anda di bawah. AI World Architect akan menyusun hukum sihir, faksi, dan adegan pembuka yang dapat Anda revisi.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                {GENRE_RECOMMENDATIONS.slice(0, 4).map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleSend(genre.prompt)}
                    disabled={isLoading}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0f18] hover:bg-slate-50 dark:hover:bg-[#121726] border border-slate-200/90 dark:border-white/10 hover:border-indigo-500/40 text-left transition group shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{genre.icon}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition">
                          {genre.label}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
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
            <div className="conversation-panel flex-1 overflow-y-auto space-y-3.5 pr-1 sm:pr-2 p-3 sm:p-5 rounded-2xl bg-white/90 dark:bg-[#090b12] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
              {campaign.worldbuildingMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white flex items-center justify-center shrink-0 text-xs font-mono font-bold shadow-xs">
                        WA
                      </div>
                    )}
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4.5 text-xs sm:text-sm leading-relaxed border relative transition ${
                        isUser
                          ? 'bg-slate-900 text-white dark:bg-[#161a29] dark:border-white/10 rounded-tr-none shadow-xs'
                          : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-[#0d101a] dark:border-white/[0.07] dark:text-slate-200 rounded-tl-none shadow-xs whitespace-pre-wrap'
                      }`}
                    >
                      {msg.content}

                      {!isUser && (
                        <div className="mt-2 pt-1 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
                            title="Salin isi pesan"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shrink-0 text-xs font-mono font-bold shadow-xs">
                        ME
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2.5 sm:gap-3 items-center text-slate-500 dark:text-slate-400 text-xs font-mono">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="animate-pulse">World Architect sedang merumuskan semesta & hukum realitas...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Interactive Quick Revision Chips */}
          {hasStarted && (
            <div className="pt-2 pb-1 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 font-mono">
                  <SlidersHorizontal className="w-3 h-3 text-indigo-400" /> Revisi Cepat:
                </span>
                {REVISION_PROMPTS.map((rev, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(rev.prompt)}
                    disabled={isLoading}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/30 text-[11px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap shrink-0 transition"
                  >
                    + {rev.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Draft & Lock Lore Mobile / Compact Bar */}
          {hasStarted && (
            <div className="flex lg:hidden flex-wrap items-center justify-between gap-2 px-3 py-2 my-1 rounded-xl bg-slate-100/90 dark:bg-[#0c0f18] border border-slate-200 dark:border-white/[0.08] shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  {savedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedFeedback ? 'Tersimpan!' : 'Simpan'}</span>
                </button>

                <button
                  onClick={onExportMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Ekspor .MD</span>
                </button>
              </div>

              <button
                onClick={handleLockLore}
                disabled={isExtracting || isLoading}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0 shadow-md shadow-indigo-500/25 ml-auto active:scale-95"
              >
                {isExtracting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                <span>Kunci Lore & Masuk Roleplay &rarr;</span>
              </button>
            </div>
          )}

          {/* Error Diagnosis Banner with 1-Click Recovery */}
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

          {/* Input Composer */}
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
                  ? 'Minta revisi dunia (misal: "tambah naga kuno", "ubah sistem sihir kristal")...'
                  : 'Tuliskan ide konsep Anda atau pilih rekomendasi genre di atas...'
              }
              disabled={isLoading}
              className="flex-1 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-[#0c0f18] border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition shadow-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 font-semibold text-xs sm:text-sm transition disabled:opacity-40 flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 shrink-0 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Lore Blueprint Sidebar on Desktop (Hidden on Mobile) */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-92 h-full rounded-2xl bg-white/90 dark:bg-[#0c0f18] border border-slate-200/90 dark:border-white/[0.08] p-4 shadow-xs overflow-hidden shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-xs tracking-wide uppercase font-mono text-slate-900 dark:text-white">
                Cetak Biru Semesta
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 font-bold">
              {campaign.lore.genre || 'Draf'}
            </span>
          </div>

          {/* Blueprint Cards */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Judul Semesta</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {campaign.name || 'Semesta Baru'}
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Titik Permulaan</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{campaign.lore.currentLocation || 'Akan ditentukan oleh percakapan'}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Tokoh Pemain</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{campaign.player.name} ({campaign.player.role})</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Catatan Dunia</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                {campaign.lore.summary || 'Ketikkan konsep Anda atau pilih genre di samping untuk merumuskan catatan semesta.'}
              </p>
            </div>
          </div>

          {/* Desktop Primary Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2 shrink-0">
            <button
              onClick={handleLockLore}
              disabled={isExtracting || isLoading || !hasStarted}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-md shadow-indigo-500/25 disabled:opacity-40 active:scale-98"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyusun Codex...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Kunci Lore & Masuk Roleplay &rarr;</span>
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleSaveDraft}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                {savedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedFeedback ? 'Tersimpan!' : 'Simpan'}</span>
              </button>

              <button
                onClick={onExportMarkdown}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Ekspor .MD</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
