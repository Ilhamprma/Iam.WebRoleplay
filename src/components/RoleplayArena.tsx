import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RefreshCw,
  Dices,
  BookOpen,
  Trash2,
  Edit2,
  Check,
  X,
  Activity,
  Quote,
  HelpCircle,
  AlertCircle,
  Cpu,
  Settings,
} from 'lucide-react';
import { Campaign, ApiConfig, Message } from '../types/campaign';
import {
  sendChatMessage,
  buildRoleplaySystemPrompt,
} from '../services/aiService';
import { FormattedStoryMessage } from '../utils/messageParser';

interface RoleplayArenaProps {
  campaign: Campaign;
  apiConfig: ApiConfig;
  onAddMessage: (message: { sender: 'user' | 'assistant'; content: string }) => void;
  onUpdateMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onOpenCodex: () => void;
  onOpenSettings?: () => void;
  onSwitchToSimulator?: () => void;
}

export const RoleplayArena: React.FC<RoleplayArenaProps> = ({
  campaign,
  apiConfig,
  onAddMessage,
  onUpdateMessage,
  onDeleteMessage,
  onOpenCodex,
  onOpenSettings,
  onSwitchToSimulator,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [campaign.roleplayMessages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setError(null);

    onAddMessage({ sender: 'user', content: textToSend });

    const updatedMessages = [
      ...campaign.roleplayMessages,
      { id: `temp_${Date.now()}`, sender: 'user' as const, content: textToSend, timestamp: Date.now() },
    ];

    setIsLoading(true);
    try {
      const systemPrompt = buildRoleplaySystemPrompt(campaign);
      const reply = await sendChatMessage(updatedMessages, systemPrompt, apiConfig);
      onAddMessage({ sender: 'assistant', content: reply });
    } catch (err: any) {
      setError(err.message || 'Gagal menerima balasan Game Master.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateLast = async () => {
    if (isLoading || campaign.roleplayMessages.length < 2) return;
    const lastMsg = campaign.roleplayMessages[campaign.roleplayMessages.length - 1];
    if (lastMsg.sender !== 'assistant') return;

    onDeleteMessage(lastMsg.id);
    const messagesWithoutLast = campaign.roleplayMessages.slice(0, -1);

    setIsLoading(true);
    setError(null);
    try {
      const systemPrompt = buildRoleplaySystemPrompt(campaign);
      const reply = await sendChatMessage(messagesWithoutLast, systemPrompt, apiConfig);
      onAddMessage({ sender: 'assistant', content: reply });
    } catch (err: any) {
      setError(err.message || 'Gagal me-regenerate respons.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollDice = (sides: number = 20) => {
    const roll = Math.floor(Math.random() * sides) + 1;
    const outcome = roll === 20 ? 'CRITICAL SUCCESS!' : roll === 1 ? 'CRITICAL FAILURE!' : 'Hasil Dadu';
    const rollText = `*Melempar D${sides}: Hasil [${roll}/${sides}] — ${outcome}*`;
    handleSendMessage(rollText);
  };

  const insertActionModifier = (type: 'action' | 'dialogue' | 'whisper') => {
    if (type === 'action') {
      setInput((prev) => (prev ? `${prev} *tindakan di sini*` : `*tindakan di sini* `));
    } else if (type === 'dialogue') {
      setInput((prev) => (prev ? `${prev} "dialog di sini"` : `"dialog di sini" `));
    } else if (type === 'whisper') {
      setInput((prev) => `[Catatan ke GM: ...] ${prev}`);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editContent.trim()) {
      onUpdateMessage(id, editContent.trim());
    }
    setEditingMessageId(null);
  };

  const handleSwitchSimulatorAndClear = () => {
    if (onSwitchToSimulator) {
      onSwitchToSimulator();
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] max-w-5xl mx-auto w-full px-2.5 sm:px-4 md:px-6 py-2 sm:py-3">
      {/* Top Scene Context Banner */}
      <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 mb-2 rounded-xl bg-white dark:bg-[#0c0e15] border border-slate-200 dark:border-white/[0.08] shadow-xs text-xs shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0 pr-2">
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold shrink-0">
            Lokasi
          </span>
          <span className="font-bold text-slate-900 dark:text-white truncate text-xs">
            {campaign.lore.currentLocation || 'Titik Permulaan'}
          </span>
          <span className="text-slate-400 hidden md:inline">&bull;</span>
          <span className="text-slate-500 truncate hidden md:inline">
            {campaign.player.name} ({campaign.player.role})
          </span>
        </div>

        <button
          onClick={onOpenCodex}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-semibold transition shrink-0 text-xs active:scale-95"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Codex & Inventaris</span>
          <span className="sm:hidden">Codex</span>
        </button>
      </div>

      {/* Main Narrative Chronicle Feed */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 sm:pr-2 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#090b10] border border-slate-200 dark:border-white/[0.06] shadow-xs">
        {campaign.roleplayMessages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isLastAssistant =
            !isUser &&
            index === campaign.roleplayMessages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shrink-0 text-xs font-mono font-bold shadow-xs">
                  GM
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-3xl rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed border transition relative ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-[#151822] dark:border-white/10 rounded-tr-none shadow-xs'
                    : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-[#0e1118] dark:border-white/[0.06] dark:text-slate-300 rounded-tl-none shadow-xs'
                }`}
              >
                {editingMessageId === msg.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-[#060810] border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="px-2.5 py-1 rounded-md text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5 inline mr-1" /> Batal
                      </button>
                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold"
                      >
                        <Check className="w-3.5 h-3.5 inline mr-1" /> Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <FormattedStoryMessage content={msg.content} isUser={isUser} />

                    {/* Action Toolbar on Message Hover / Mobile Action */}
                    <div className="mt-2 pt-1 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingMessageId(msg.id);
                          setEditContent(msg.content);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                        title="Edit teks pesan"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {isLastAssistant && (
                        <button
                          onClick={handleRegenerateLast}
                          disabled={isLoading}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                          title="Generate ulang narasi ini"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteMessage(msg.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 transition"
                        title="Hapus pesan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
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
            <span>Game Master sedang merajut kelanjutan takdir...</span>
          </div>
        )}

        {/* Error diagnosis */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs space-y-2">
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
                  <span>Aktifkan Simulator Offline</span>
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

        <div ref={messagesEndRef} />
      </div>

      {/* Action Modifiers & Tools (Scrollable on narrow mobile screens) */}
      <div className="flex items-center justify-between gap-1.5 my-1.5 text-xs shrink-0 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => insertActionModifier('action')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0c0e15] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition shadow-xs whitespace-nowrap active:scale-95"
          >
            <Activity className="w-3 h-3 text-slate-500 dark:text-slate-300" />
            *Tindakan*
          </button>

          <button
            type="button"
            onClick={() => insertActionModifier('dialogue')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0c0e15] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition shadow-xs whitespace-nowrap active:scale-95"
          >
            <Quote className="w-3 h-3 text-slate-500 dark:text-slate-300" />
            "Bicara"
          </button>

          <button
            type="button"
            onClick={() => insertActionModifier('whisper')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0c0e15] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[11px] transition shadow-xs whitespace-nowrap active:scale-95"
          >
            <HelpCircle className="w-3 h-3" />
            Whisper GM
          </button>
        </div>

        {/* Dice Roller */}
        <button
          type="button"
          onClick={() => handleRollDice(20)}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-[11px] font-bold transition shadow-xs whitespace-nowrap shrink-0 active:scale-95 ml-auto"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Roll D20</span>
        </button>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-1.5 sm:gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tuliskan tindakan (*melangkah maju*) atau ucapan (&quot;Siapa di sana?&quot;)..."
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
