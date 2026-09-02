export interface ApiConfig {
  provider: 'openrouter' | 'openai' | 'groq' | 'ollama' | 'custom' | 'simulation';
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  customHeaders?: Record<string, string>;
}

export interface NpcEntry {
  id: string;
  name: string;
  role: string;
  description: string;
  relationship: string;
}

export interface WorldLore {
  title: string;
  genre: string;
  summary: string;
  rules: string;
  factions: string[];
  currentLocation: string;
  npcs: NpcEntry[];
  quests: string[];
}

export interface CharacterProfile {
  name: string;
  role: string;
  description: string;
  inventory: string[];
  status: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface SaveCheckpoint {
  id: string;
  name: string;
  phase: 'worldbuilding' | 'roleplay';
  lore: WorldLore;
  player: CharacterProfile;
  worldbuildingMessages: Message[];
  roleplayMessages: Message[];
  createdAt: number;
}

export interface Campaign {
  id: string;
  name: string;
  phase: 'worldbuilding' | 'roleplay';
  lore: WorldLore;
  player: CharacterProfile;
  worldbuildingMessages: Message[];
  roleplayMessages: Message[];
  checkpoints?: SaveCheckpoint[];
  createdAt: number;
  updatedAt: number;
}
