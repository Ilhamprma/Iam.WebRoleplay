import { useState, useEffect } from 'react';
import { ApiConfig, Campaign, Message, WorldLore, CharacterProfile, SaveCheckpoint } from '../types/campaign';
import { DEFAULT_API_CONFIG } from '../services/aiService';
import { extractJsonFromText } from '../utils/jsonParser';

const STORAGE_KEYS = {
  CAMPAIGNS: 'ai_roleplay_campaigns_v1',
  ACTIVE_ID: 'ai_roleplay_active_id_v1',
  API_CONFIG: 'ai_roleplay_api_config_v1',
};

function createInitialCampaign(): Campaign {
  return {
    id: `camp_${Date.now()}`,
    name: 'Petualangan Baru',
    phase: 'worldbuilding',
    lore: {
      title: 'Semesta Baru',
      genre: 'Custom Fantasy & Sci-Fi',
      summary: 'Dunia yang siap dirancang melalui diskusi interaktif bersama AI Architect.',
      rules: 'Hukum realitas disepakati bersama dalam narasi.',
      factions: [],
      currentLocation: 'Titik Awal',
      npcs: [],
      quests: ['Bangun dunia bersama AI Architect lalu mulai petualangan'],
    },
    player: {
      name: 'Petualang Utama',
      role: 'Protagonis',
      description: 'Tokoh utama yang siap menjelajahi semesta ini.',
      inventory: ['Peta Kosong', 'Jurnal Petualang', 'Bekal Perjalanan'],
      status: 'Siap Bertualang',
    },
    worldbuildingMessages: [
      {
        id: `msg_init`,
        sender: 'assistant',
        content: `Halo! Saya adalah **AI World Architect** Anda.\n\nSebelum kita mulai bermain peran (*roleplay*), mari kita rancang dulu semesta cerita Anda.\n\n1. **Tema/Genre apa** yang ingin Anda bangun? (Contoh: *Dark Fantasy kerajaan runtuh, Cyberpunk kota bawah tanah 2088, Eksplorasi luar angkasa, Misteri detektif supernatural*, dll.)\n2. Seperti apa **suasana dan konflik utama** yang Anda inginkan?`,
        timestamp: Date.now(),
      },
    ],
    roleplayMessages: [],
    checkpoints: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function useCampaignStore() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load campaigns:', e);
    }
    return [createInitialCampaign()];
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
    return savedId || campaigns[0]?.id || '';
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved) as ApiConfig;
        if (parsed.baseUrl.includes('real-terms-roll.loca.lt')) {
          return DEFAULT_API_CONFIG;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load API config:', e);
    }
    return DEFAULT_API_CONFIG;
  });

  const [lastSavedTime, setLastSavedTime] = useState<number>(Date.now());

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      setLastSavedTime(Date.now());
    } catch (e) {
      console.error('Failed to save campaigns:', e);
    }
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeCampaignId);
  }, [activeCampaignId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(apiConfig));
    } catch (e) {
      console.error('Failed to save API config:', e);
    }
  }, [apiConfig]);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0] || createInitialCampaign();

  const updateActiveCampaign = (updater: (prev: Campaign) => Campaign) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === activeCampaign.id) {
          const updated = updater(c);
          return { ...updated, updatedAt: Date.now() };
        }
        return c;
      })
    );
  };

  const createNewCampaign = (name: string = 'Semesta Baru', genrePrompt?: string): Campaign => {
    const newCamp = createInitialCampaign();
    newCamp.name = name;
    if (genrePrompt) {
      newCamp.lore.genre = genrePrompt;
    }
    setCampaigns((prev) => [newCamp, ...prev]);
    setActiveCampaignId(newCamp.id);
    return newCamp;
  };

  const deleteCampaign = (id: string) => {
    if (campaigns.length <= 1) {
      const fresh = createInitialCampaign();
      setCampaigns([fresh]);
      setActiveCampaignId(fresh.id);
      return;
    }
    const filtered = campaigns.filter((c) => c.id !== id);
    setCampaigns(filtered);
    if (activeCampaignId === id) {
      setActiveCampaignId(filtered[0]?.id || '');
    }
  };

  const addMessage = (phase: 'worldbuilding' | 'roleplay', message: Omit<Message, 'id' | 'timestamp'>) => {
    const fullMsg: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };

    updateActiveCampaign((c) => ({
      ...c,
      worldbuildingMessages:
        phase === 'worldbuilding'
          ? [...c.worldbuildingMessages, fullMsg]
          : c.worldbuildingMessages,
      roleplayMessages:
        phase === 'roleplay' ? [...c.roleplayMessages, fullMsg] : c.roleplayMessages,
    }));
    return fullMsg;
  };

  const deleteMessage = (phase: 'worldbuilding' | 'roleplay', messageId: string) => {
    updateActiveCampaign((c) => ({
      ...c,
      worldbuildingMessages:
        phase === 'worldbuilding'
          ? c.worldbuildingMessages.filter((m) => m.id !== messageId)
          : c.worldbuildingMessages,
      roleplayMessages:
        phase === 'roleplay'
          ? c.roleplayMessages.filter((m) => m.id !== messageId)
          : c.roleplayMessages,
    }));
  };

  const updateMessage = (phase: 'worldbuilding' | 'roleplay', messageId: string, newContent: string) => {
    updateActiveCampaign((c) => ({
      ...c,
      worldbuildingMessages:
        phase === 'worldbuilding'
          ? c.worldbuildingMessages.map((m) => (m.id === messageId ? { ...m, content: newContent } : m))
          : c.worldbuildingMessages,
      roleplayMessages:
        phase === 'roleplay'
          ? c.roleplayMessages.map((m) => (m.id === messageId ? { ...m, content: newContent } : m))
          : c.roleplayMessages,
    }));
  };

  const transitionToRoleplay = (extractedLore?: Partial<WorldLore>, startingMessage?: string) => {
    updateActiveCampaign((c) => {
      const updatedLore = { ...c.lore, ...(extractedLore || {}) };
      const initialGreeting: Message = {
        id: `msg_rp_start`,
        sender: 'assistant',
        content:
          startingMessage ||
          `*Kisah dimulai di ${updatedLore.currentLocation || 'sebuah tempat yang penuh misteri'}. ${updatedLore.summary || ''}*\n\n*Anda (${c.player.name}, seorang ${c.player.role}) berdiri di titik awal perjalanan ini.*\n\n"Selamat datang di ${updatedLore.title}." *Udara di sekitar Anda berdesir saat takdir mulai bergerak.*\n\n*Apa langkah pertama yang ingin Anda ambil?*`,
        timestamp: Date.now(),
      };

      return {
        ...c,
        phase: 'roleplay',
        lore: updatedLore,
        roleplayMessages: c.roleplayMessages.length === 0 ? [initialGreeting] : c.roleplayMessages,
      };
    });
  };

  const returnToWorldbuilding = () => {
    updateActiveCampaign((c) => ({
      ...c,
      phase: 'worldbuilding',
    }));
  };

  const updateLore = (newLore: Partial<WorldLore>) => {
    updateActiveCampaign((c) => ({
      ...c,
      lore: { ...c.lore, ...newLore },
    }));
  };

  const updatePlayer = (newPlayer: Partial<CharacterProfile>) => {
    updateActiveCampaign((c) => ({
      ...c,
      player: { ...c.player, ...newPlayer },
    }));
  };

  // Checkpoint & Save Progress Features
  const createSaveCheckpoint = (customName?: string): SaveCheckpoint => {
    const cpName =
      customName?.trim() ||
      `${activeCampaign.phase === 'worldbuilding' ? 'Worldbuilding' : 'Roleplay'} Checkpoint - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newCp: SaveCheckpoint = {
      id: `cp_${Date.now()}`,
      name: cpName,
      phase: activeCampaign.phase,
      lore: JSON.parse(JSON.stringify(activeCampaign.lore)),
      player: JSON.parse(JSON.stringify(activeCampaign.player)),
      worldbuildingMessages: JSON.parse(JSON.stringify(activeCampaign.worldbuildingMessages)),
      roleplayMessages: JSON.parse(JSON.stringify(activeCampaign.roleplayMessages)),
      createdAt: Date.now(),
    };

    updateActiveCampaign((c) => ({
      ...c,
      checkpoints: [newCp, ...(c.checkpoints || [])],
    }));

    return newCp;
  };

  const restoreSaveCheckpoint = (checkpointId: string): boolean => {
    const cp = activeCampaign.checkpoints?.find((c) => c.id === checkpointId);
    if (!cp) return false;

    updateActiveCampaign((c) => ({
      ...c,
      phase: cp.phase,
      lore: JSON.parse(JSON.stringify(cp.lore)),
      player: JSON.parse(JSON.stringify(cp.player)),
      worldbuildingMessages: JSON.parse(JSON.stringify(cp.worldbuildingMessages)),
      roleplayMessages: JSON.parse(JSON.stringify(cp.roleplayMessages)),
    }));

    return true;
  };

  const deleteSaveCheckpoint = (checkpointId: string) => {
    updateActiveCampaign((c) => ({
      ...c,
      checkpoints: (c.checkpoints || []).filter((cp) => cp.id !== checkpointId),
    }));
  };

  const triggerManualSave = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      setLastSavedTime(Date.now());
      return true;
    } catch (e) {
      console.error('Manual save failed:', e);
      return false;
    }
  };

  const exportWorldbuildingMarkdown = () => {
    const { lore, player, worldbuildingMessages } = activeCampaign;
    const mdContent = `# 📜 CODEX LORE: ${lore.title || 'Dunia Belum Bernama'}
*Genre / Tema: ${lore.genre || 'Kustom'}*
*Waktu Ekspor: ${new Date().toLocaleString('id-ID')}*

---

## 🌌 Ringkasan Semesta
${lore.summary || 'Belum ada ringkasan.'}

## ⚡ Hukum Realitas & Sistem Kekuatan
${lore.rules || 'Sesuai dengan kesepakatan cerita.'}

## 🏰 Faksi & Kekuatan Dunia
${lore.factions?.length ? lore.factions.map((f) => `- **${f}**`).join('\n') : '- Belum ada faksi tercatat.'}

## 📍 Titik Awal & Lokasi
**Lokasi Dimulai:** ${lore.currentLocation || 'Titik Awal'}

## 👤 Profil Tokoh Utama
- **Nama:** ${player.name}
- **Peran / Keahlian:** ${player.role}
- **Status:** ${player.status}
- **Deskripsi:** ${player.description}
- **Inventaris Awal:** ${player.inventory?.join(', ') || 'Perlengkapan dasar'}

## 🎯 Misi & Misteri Aktif
${lore.quests?.length ? lore.quests.map((q) => `- [ ] ${q}`).join('\n') : '- [ ] Eksplorasi semesta'}

## 👥 Tokoh & NPC yang Dikenal
${
  lore.npcs?.length
    ? lore.npcs.map((n) => `### ${n.name} (${n.role} - Relasi: ${n.relationship})\n${n.description}`).join('\n\n')
    : '_Belum ada NPC tercatat._'
}

---

## 💬 Transkrip Diskusi World Architect
${worldbuildingMessages.map((m) => `**[${m.sender === 'user' ? 'Pemain' : 'World Architect'}]:**\n${m.content}\n`).join('\n')}
`;

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${(lore.title || activeCampaign.name).toLowerCase().replace(/\s+/g, '_')}_lorebook.md`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportActiveCampaign = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeCampaign, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeCampaign.name.toLowerCase().replace(/\s+/g, '_')}_campaign.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importCampaign = (jsonStr: string): boolean => {
    try {
      const parsed = extractJsonFromText<any>(jsonStr, null);
      if (parsed && parsed.id && parsed.name && parsed.lore) {
        const imported: Campaign = {
          ...parsed,
          id: `camp_${Date.now()}`,
          name: `${parsed.name} (Imported)`,
        };
        setCampaigns((prev) => [imported, ...prev]);
        setActiveCampaignId(imported.id);
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  };

  return {
    campaigns,
    activeCampaign,
    activeCampaignId,
    setActiveCampaignId,
    createNewCampaign,
    deleteCampaign,
    addMessage,
    deleteMessage,
    updateMessage,
    transitionToRoleplay,
    returnToWorldbuilding,
    updateLore,
    updatePlayer,
    apiConfig,
    setApiConfig,
    exportActiveCampaign,
    importCampaign,
    // New Save & Checkpoint functions:
    createSaveCheckpoint,
    restoreSaveCheckpoint,
    deleteSaveCheckpoint,
    triggerManualSave,
    exportWorldbuildingMarkdown,
    lastSavedTime,
  };
}
