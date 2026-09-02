import React, { useState } from 'react';
import {
  X,
  BookOpen,
  User,
  Users,
  Shield,
  MapPin,
  CheckSquare,
  Trash2,
  Edit3,
  Save,
} from 'lucide-react';
import { Campaign, WorldLore, CharacterProfile, NpcEntry } from '../types/campaign';

interface WorldCodexDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onUpdateLore: (lore: Partial<WorldLore>) => void;
  onUpdatePlayer: (player: Partial<CharacterProfile>) => void;
}

export const WorldCodexDrawer: React.FC<WorldCodexDrawerProps> = ({
  isOpen,
  onClose,
  campaign,
  onUpdateLore,
  onUpdatePlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'world' | 'player' | 'npcs' | 'quests'>('world');
  const [isEditingLore, setIsEditingLore] = useState(false);

  // Editable Lore State
  const [loreForm, setLoreForm] = useState<WorldLore>({ ...campaign.lore });
  const [playerForm, setPlayerForm] = useState<CharacterProfile>({ ...campaign.player });

  // Quick Add Item / Quest / NPC
  const [newItemName, setNewItemName] = useState('');
  const [newQuestName, setNewQuestName] = useState('');
  const [newNpc, setNewNpc] = useState({ name: '', role: '', description: '' });
  const [isAddingNpc, setIsAddingNpc] = useState(false);

  if (!isOpen) return null;

  const handleSaveLore = () => {
    onUpdateLore(loreForm);
    setIsEditingLore(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const updatedInventory = [...(campaign.player.inventory || []), newItemName.trim()];
    onUpdatePlayer({ inventory: updatedInventory });
    setPlayerForm((prev) => ({ ...prev, inventory: updatedInventory }));
    setNewItemName('');
  };

  const handleRemoveItem = (index: number) => {
    const updatedInventory = campaign.player.inventory.filter((_, i) => i !== index);
    onUpdatePlayer({ inventory: updatedInventory });
    setPlayerForm((prev) => ({ ...prev, inventory: updatedInventory }));
  };

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestName.trim()) return;
    const updatedQuests = [...(campaign.lore.quests || []), newQuestName.trim()];
    onUpdateLore({ quests: updatedQuests });
    setLoreForm((prev) => ({ ...prev, quests: updatedQuests }));
    setNewQuestName('');
  };

  const handleRemoveQuest = (index: number) => {
    const updatedQuests = campaign.lore.quests.filter((_, i) => i !== index);
    onUpdateLore({ quests: updatedQuests });
    setLoreForm((prev) => ({ ...prev, quests: updatedQuests }));
  };

  const handleAddNpcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNpc.name.trim()) return;
    const npcEntry: NpcEntry = {
      id: `npc_${Date.now()}`,
      name: newNpc.name.trim(),
      role: newNpc.role.trim() || 'Penduduk',
      description: newNpc.description.trim() || 'Tokoh yang ditemui dalam petualangan.',
      relationship: 'Netral',
    };
    const updatedNpcs = [...(campaign.lore.npcs || []), npcEntry];
    onUpdateLore({ npcs: updatedNpcs });
    setLoreForm((prev) => ({ ...prev, npcs: updatedNpcs }));
    setNewNpc({ name: '', role: '', description: '' });
    setIsAddingNpc(false);
  };

  const handleRemoveNpc = (id: string) => {
    const updatedNpcs = campaign.lore.npcs.filter((n) => n.id !== id);
    onUpdateLore({ npcs: updatedNpcs });
    setLoreForm((prev) => ({ ...prev, npcs: updatedNpcs }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg h-full bg-white dark:bg-[#0c0f18] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col text-slate-900 dark:text-white">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <h2 className="text-sm font-bold tracking-wide">WORLD CODEX & ARCHIVES</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080a11] text-xs">
          {[
            { id: 'world', label: 'Semesta', icon: MapPin },
            { id: 'player', label: 'Karakter', icon: User },
            { id: 'npcs', label: 'NPC & Faksi', icon: Users },
            { id: 'quests', label: 'Tujuan & Quest', icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 font-semibold transition border-b-2 ${
                  isActive
                    ? 'border-slate-900 dark:border-white text-slate-950 dark:text-white bg-slate-200/50 dark:bg-white/10'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: WORLD LORE */}
          {activeTab === 'world' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catatan Realitas</span>
                <button
                  onClick={() => (isEditingLore ? handleSaveLore() : setIsEditingLore(true))}
                  className="text-xs text-slate-900 dark:text-white hover:underline flex items-center gap-1 font-semibold"
                >
                  {isEditingLore ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  {isEditingLore ? 'Simpan' : 'Edit Lore'}
                </button>
              </div>

              {isEditingLore ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Nama Semesta / Judul</label>
                    <input
                      type="text"
                      value={loreForm.title}
                      onChange={(e) => setLoreForm({ ...loreForm, title: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Genre / Tema</label>
                    <input
                      type="text"
                      value={loreForm.genre}
                      onChange={(e) => setLoreForm({ ...loreForm, genre: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Lokasi Saat Ini</label>
                    <input
                      type="text"
                      value={loreForm.currentLocation}
                      onChange={(e) => setLoreForm({ ...loreForm, currentLocation: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Ringkasan Dunia</label>
                    <textarea
                      rows={4}
                      value={loreForm.summary}
                      onChange={(e) => setLoreForm({ ...loreForm, summary: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Hukum Realitas / Sihir / Teknologi</label>
                    <textarea
                      rows={3}
                      value={loreForm.rules}
                      onChange={(e) => setLoreForm({ ...loreForm, rules: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Semesta</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{campaign.lore.title || 'Dunia Belum Bernama'}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{campaign.lore.genre || 'Kustom'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Lokasi Saat Ini</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{campaign.lore.currentLocation || 'Titik Awal'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Ringkasan Latar</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{campaign.lore.summary || 'Belum ada ringkasan latar.'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Hukum Realitas & Sistem</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{campaign.lore.rules || 'Sesuai dengan kesepakatan cerita.'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLAYER PROFILE & INVENTORY */}
          {activeTab === 'player' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Profil Tokoh Utama</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-0.5">Nama Karakter</label>
                    <input
                      type="text"
                      value={playerForm.name}
                      onChange={(e) => {
                        setPlayerForm({ ...playerForm, name: e.target.value });
                        onUpdatePlayer({ name: e.target.value });
                      }}
                      className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-0.5">Peran / Kelas / Keahlian</label>
                    <input
                      type="text"
                      value={playerForm.role}
                      onChange={(e) => {
                        setPlayerForm({ ...playerForm, role: e.target.value });
                        onUpdatePlayer({ role: e.target.value });
                      }}
                      className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-0.5">Status Kondisi Saat Ini</label>
                    <input
                      type="text"
                      value={playerForm.status}
                      onChange={(e) => {
                        setPlayerForm({ ...playerForm, status: e.target.value });
                        onUpdatePlayer({ status: e.target.value });
                      }}
                      className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-0.5">Deskripsi / Latar Belakang</label>
                    <textarea
                      rows={3}
                      value={playerForm.description}
                      onChange={(e) => {
                        setPlayerForm({ ...playerForm, description: e.target.value });
                        onUpdatePlayer({ description: e.target.value });
                      }}
                      className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Inventaris & Perlengkapan ({campaign.player.inventory?.length || 0})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {campaign.player.inventory?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddItem} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah item baru..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                  />
                  <button type="submit" className="px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold">
                    +
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: NPCS & FACTIONS */}
          {activeTab === 'npcs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tokoh & Faksi</span>
                <button
                  onClick={() => setIsAddingNpc(!isAddingNpc)}
                  className="text-xs text-slate-900 dark:text-white hover:underline font-semibold"
                >
                  {isAddingNpc ? 'Batal' : '+ Tambah NPC'}
                </button>
              </div>

              {isAddingNpc && (
                <form onSubmit={handleAddNpcSubmit} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nama NPC"
                    value={newNpc.name}
                    onChange={(e) => setNewNpc({ ...newNpc, name: e.target.value })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Peran / Gelar (e.g. Pedagang Senjata / Tetua Desa)"
                    value={newNpc.role}
                    onChange={(e) => setNewNpc({ ...newNpc, role: e.target.value })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Deskripsi singkat & relasi..."
                    value={newNpc.description}
                    onChange={(e) => setNewNpc({ ...newNpc, description: e.target.value })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                  <button type="submit" className="w-full py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold">
                    Simpan Tokoh
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {campaign.lore.npcs?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada tokoh atau NPC yang dicatat.</p>
                ) : (
                  campaign.lore.npcs?.map((npc) => (
                    <div key={npc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 dark:text-white">{npc.name}</h4>
                        <button onClick={() => handleRemoveNpc(npc.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono block">{npc.role}</span>
                      <p className="text-slate-700 dark:text-slate-300">{npc.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUESTS */}
          {activeTab === 'quests' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Misi & Target Cerita</span>

              <div className="space-y-2">
                {campaign.lore.quests?.map((quest, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <span className="leading-relaxed">{quest}</span>
                    <button onClick={() => handleRemoveQuest(idx)} className="text-slate-400 hover:text-red-500 shrink-0 mt-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddQuest} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Tambah quest / tujuan baru..."
                  value={newQuestName}
                  onChange={(e) => setNewQuestName(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                />
                <button type="submit" className="px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs">
                  +
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
