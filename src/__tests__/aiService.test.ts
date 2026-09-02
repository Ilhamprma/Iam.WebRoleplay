import { describe, it, expect } from 'vitest';
import {
  sendChatMessage,
  buildWorldbuildingSystemPrompt,
  buildRoleplaySystemPrompt,
  extractWorldCodexFromChat,
  DEFAULT_API_CONFIG,
} from '../services/aiService';
import { Campaign, Message } from '../types/campaign';

const mockCampaign: Campaign = {
  id: 'camp_test',
  name: 'Test Universe',
  phase: 'worldbuilding',
  lore: {
    title: 'Aethelgard',
    genre: 'Dark Fantasy',
    summary: 'Kerajaan kuno yang dilanda kabut hitam.',
    rules: 'Sihir membutuhkan pengorbanan kristal.',
    factions: ['Ordo Ksatria', 'Penyihir Bayangan'],
    currentLocation: 'Gerbang Utara',
    npcs: [{ id: '1', name: 'Althea', role: 'Penjaga', description: 'Ksatria tangguh', relationship: 'Netral' }],
    quests: ['Temukan artefak kuno'],
  },
  player: {
    name: 'Vaelen',
    role: 'Pemanah Elit',
    description: 'Petualang bertudung hitam.',
    inventory: ['Busur Kayu Yew', '5x Panah Perak'],
    status: 'Bugar',
  },
  worldbuildingMessages: [],
  roleplayMessages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('AI Service & Multi-Provider Regression Tests', () => {
  it('generates valid worldbuilding system prompt', () => {
    const prompt = buildWorldbuildingSystemPrompt();
    expect(prompt).toContain('World Architect');
    expect(prompt).toContain('Indonesian');
  });

  it('generates valid roleplay system prompt containing world lore and character profile', () => {
    const prompt = buildRoleplaySystemPrompt(mockCampaign);
    expect(prompt).toContain('Aethelgard');
    expect(prompt).toContain('Dark Fantasy');
    expect(prompt).toContain('Vaelen');
    expect(prompt).toContain('Pemanah Elit');
    expect(prompt).toContain('CARDINAL RULES OF GAME MASTERING');
    expect(prompt).toContain('ZERO GODMODING');
  });

  it('uses simulation engine fallback when in simulation mode without crashing', async () => {
    const messages: Message[] = [
      { id: '1', sender: 'user', content: 'Halo, saya ingin membuat dunia cyberpunk.', timestamp: Date.now() },
    ];
    const result = await sendChatMessage(
      messages,
      buildWorldbuildingSystemPrompt(),
      { ...DEFAULT_API_CONFIG, provider: 'simulation' }
    );
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(10);
  });

  it('handles simulated roleplay actions correctly', async () => {
    const messages: Message[] = [
      { id: '1', sender: 'user', content: '*Saya melihat ke sekeliling ruangan*', timestamp: Date.now() },
    ];
    const result = await sendChatMessage(
      messages,
      buildRoleplaySystemPrompt(mockCampaign),
      { ...DEFAULT_API_CONFIG, provider: 'simulation' }
    );
    expect(result).toBeDefined();
    expect(result).toContain('*');
  });

  it('safely extracts world codex JSON even when output is fallback format', async () => {
    const messages: Message[] = [
      { id: '1', sender: 'user', content: 'Dunia ini bernama CyberNeo, genre Sci-Fi cyberpunk.', timestamp: Date.now() },
      { id: '2', sender: 'assistant', content: 'Bagus, mari kita mulai!', timestamp: Date.now() },
    ];
    const codex = await extractWorldCodexFromChat(messages, {
      ...DEFAULT_API_CONFIG,
      provider: 'simulation',
    });
    expect(codex).toBeDefined();
    expect(codex.title).toBeDefined();
  });
});
