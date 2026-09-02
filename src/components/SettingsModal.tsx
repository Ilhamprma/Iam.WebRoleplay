import React, { useState } from 'react';
import {
  X,
  Check,
  Key,
  Globe,
  Cpu,
  Sliders,
  Shield,
  AlertCircle,
  RefreshCw,
  DownloadCloud,
} from 'lucide-react';
import { ApiConfig } from '../types/campaign';
import {
  PROVIDER_PRESETS,
  sendChatMessage,
  fetchAvailableModels,
} from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (newConfig: ApiConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<ApiConfig>({ ...config });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: ApiConfig['provider']) => {
    const preset = PROVIDER_PRESETS[provider] || {};
    setFormData((prev) => ({
      ...prev,
      provider,
      baseUrl: preset.baseUrl ?? prev.baseUrl,
      model: preset.model ?? prev.model,
    }));
    setDiscoveredModels([]);
  };

  const handleQuickModelSelect = (modelName: string) => {
    setFormData((prev) => ({ ...prev, model: modelName }));
  };

  const handleFetchServerModels = async () => {
    if (!formData.baseUrl) return;
    setIsFetchingModels(true);
    setTestMessage('');
    try {
      const models = await fetchAvailableModels(formData.baseUrl, formData.apiKey);
      if (models.length > 0) {
        setDiscoveredModels(models);
        setTestStatus('success');
        setTestMessage(`Ditemukan ${models.length} model dari server.`);
        if (!formData.model || !models.includes(formData.model)) {
          setFormData((prev) => ({ ...prev, model: models[0] }));
        }
      } else {
        setTestStatus('error');
        setTestMessage('Server merespons tetapi tidak ditemukan daftar model pada endpoint /models.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage('Gagal mengambil daftar model dari server.');
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Menghubungkan ke model AI...');
    try {
      const reply = await sendChatMessage(
        [{ id: 'test_1', sender: 'user', content: 'Katakan "Koneksi Berhasil!" dalam 3 kata.', timestamp: Date.now() }],
        'You are a testing assistant. Reply concisely.',
        formData
      );
      setTestStatus('success');
      setTestMessage(`Berhasil terhubung: "${reply.slice(0, 80)}"`);
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Gagal menghubungi API.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d101a] p-6 shadow-2xl text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Konfigurasi Model & Custom API</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan model AI pilihan Anda (OpenRouter, OpenAI, Groq, Ollama, atau Endpoint Lokal / Proxy).
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Penyedia Layanan (Preset)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['openrouter', 'openai', 'groq', 'ollama', 'custom', 'simulation'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  className={`py-2 px-2 rounded-lg border text-xs font-semibold capitalize text-center transition ${
                    formData.provider === p
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {p === 'simulation' ? 'Simulator' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Base URL */}
          {formData.provider !== 'simulation' && (
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Custom Endpoint / Base URL
                </label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="e.g. http://localhost:20128/v1 atau https://openrouter.ai/api/v1"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#060810] border border-slate-300 dark:border-white/10 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40 transition font-mono"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Format otomatis didukung: sistem akan otomatis menambahkan <code>/chat/completions</code> jika diperlukan.
                </p>
              </div>

              {/* API Key */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder={formData.baseUrl.includes('localhost') ? 'Masukkan API Key jika server lokal Anda memintanya' : 'sk-... atau API Key Anda'}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#060810] border border-slate-300 dark:border-white/10 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40 transition font-mono"
                />
              </div>

              {/* Model ID & Model Discovery */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    Model Identifier
                  </label>

                  <button
                    type="button"
                    onClick={handleFetchServerModels}
                    disabled={isFetchingModels || !formData.baseUrl}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition disabled:opacity-50"
                  >
                    {isFetchingModels ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <DownloadCloud className="w-3 h-3" />
                    )}
                    <span>Tarik Model dari Server</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. cl/anthropic/claude-sonnet-4.6 atau gpt-4o-mini"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#060810] border border-slate-300 dark:border-white/10 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 dark:focus:border-white/40 transition font-mono"
                  required
                />

                {/* Discovered Models Dropdown / Pills */}
                {discoveredModels.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      Ditemukan {discoveredModels.length} Model di Server:
                    </span>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#060810] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none"
                    >
                      {discoveredModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quick Model Chips */}
                {discoveredModels.length === 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-500 self-center mr-1">Pilihan Cepat:</span>
                    {(PROVIDER_PRESETS[formData.provider]?.defaultModels || [
                      'gpt-ultimate',
                      'claude-ultimate',
                      'gemini-ultimate',
                      'combo-hardcore',
                      'cl/anthropic/claude-sonnet-4.6',
                      'cl/openai/gpt-5.4',
                    ]).map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => handleQuickModelSelect(m)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                          formData.model === m
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white font-bold'
                            : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.split('/').pop()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.provider === 'simulation' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>Mesin AI Simulator Lokal Aktif</span>
              </div>
              <p>
                Mode simulasi berjalan 100% di browser secara instan tanpa membutuhkan API Key, kuota eksternal, atau koneksi internet. Sangat cocok untuk menguji alur cerita dan worldbuilding.
              </p>
            </div>
          )}

          {/* Sliders: Temperature & Max Tokens */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/10">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Temperature (Kreativitas)</span>
                <span className="font-mono">{formData.temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full accent-slate-900 dark:accent-white"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Max Tokens</span>
                <span className="font-mono">{formData.maxTokens}</span>
              </div>
              <input
                type="range"
                min="500"
                max="4000"
                step="100"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                className="w-full accent-slate-900 dark:accent-white"
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testStatus === 'testing'
                  ? 'bg-slate-100 dark:bg-white/5 border-slate-300 text-slate-700 dark:text-slate-300'
                  : testStatus === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
              {testStatus === 'success' && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{testMessage}</span>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {testStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sliders className="w-3.5 h-3.5" />}
              <span>Uji Koneksi</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 shadow-xs"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
