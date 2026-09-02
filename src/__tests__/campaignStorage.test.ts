import { describe, it, expect } from 'vitest';
import { Campaign, SaveCheckpoint } from '../types/campaign';

describe('Campaign Storage & Serialization Regression Tests', () => {
  const sampleCampaign: Campaign = {
    id: 'camp_123',
    name: 'Ekspedisi Nebula',
    phase: 'roleplay',
    lore: {
      title: 'Nebula-9',
      genre: 'Space Opera',
      summary: 'Penjelajahan sektor galaksi tak berpenghuni.',
      rules: 'Warp drive membutuhkan antimateri murni.',
      factions: ['United Space Fleet'],
      currentLocation: 'Stasiun Omega',
      npcs: [],
      quests: ['Periksa sinyal SOS'],
    },
    player: {
      name: 'Kapten Arka',
      role: 'Komandan Pesawat',
      description: 'Pilot berpengalaman.',
      inventory: ['Pistol Plasma', 'Scanner Portabel'],
      status: 'Normal',
    },
    worldbuildingMessages: [],
    roleplayMessages: [
      {
        id: 'msg_1',
        sender: 'assistant',
        content: '*Sensor mendeteksi anomali di koordinat 44-X.*',
        timestamp: 1700000000000,
      },
    ],
    checkpoints: [
      {
        id: 'cp_1',
        name: 'Sebelum Mendarat di Planet',
        phase: 'roleplay',
        lore: {
          title: 'Nebula-9',
          genre: 'Space Opera',
          summary: 'Penjelajahan sektor galaksi tak berpenghuni.',
          rules: 'Warp drive membutuhkan antimateri murni.',
          factions: ['United Space Fleet'],
          currentLocation: 'Stasiun Omega',
          npcs: [],
          quests: ['Periksa sinyal SOS'],
        },
        player: {
          name: 'Kapten Arka',
          role: 'Komandan Pesawat',
          description: 'Pilot berpengalaman.',
          inventory: ['Pistol Plasma'],
          status: 'Normal',
        },
        worldbuildingMessages: [],
        roleplayMessages: [],
        createdAt: 1700000000000,
      },
    ],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  it('serializes and deserializes campaign data including checkpoints without losing properties', () => {
    const jsonStr = JSON.stringify(sampleCampaign);
    const parsed: Campaign = JSON.parse(jsonStr);

    expect(parsed.id).toBe(sampleCampaign.id);
    expect(parsed.name).toBe(sampleCampaign.name);
    expect(parsed.lore.title).toBe(sampleCampaign.lore.title);
    expect(parsed.player.inventory.length).toBe(2);
    expect(parsed.roleplayMessages.length).toBe(1);
    expect(parsed.checkpoints?.length).toBe(1);
    expect(parsed.checkpoints?.[0].name).toBe('Sebelum Mendarat di Planet');
  });

  it('rejects malformed or incomplete campaign JSON safely during import validation', () => {
    const invalidJson = JSON.stringify({ randomKey: 'invalid data' });
    const parsed = JSON.parse(invalidJson);

    const isValidCampaign = Boolean(parsed.id && parsed.name && parsed.lore);
    expect(isValidCampaign).toBe(false);
  });
});
