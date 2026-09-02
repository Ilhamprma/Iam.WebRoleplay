# Technical Plan: AI Roleplay & Dynamic Worldbuilding Studio

## 1. Architecture Overview
Aplikasi dibangun sebagai Single Page Application (SPA) modern berbasis **React + TypeScript + Vite** dengan pendekatan *Client-Centric Zero-Server-Dependency*. Seluruh pemrosesan, penyimpanan state (*localStorage*), dan komunikasi API LLM dijalankan langsung dari browser pengguna ke endpoint AI yang dipilih.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App Container                             │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Top Bar: Campaign Title | Mode Switch | Codex Toggle | Settings    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌──────────────────────────────┬─────────────────────────────────────┐ │
│ │     Main Workspace           │      Side Drawer: World Codex       │ │
│ │                              │                                     │ │
│ │  [Phase A: Worldbuilding]   │  - Lore Summary & Universe Rules    │ │
│ │         OR                   │  - Player Character & Stats         │ │
│ │  [Phase B: Roleplay Arena]   │  - Known NPCs & Factions            │ │
│ │                              │  - Quests / Active Objectives       │ │
│ └──────────────────────────────┴─────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Component Breakdown & File Structure

### State & Models (`src/types/campaign.ts`)
- `ApiConfig`: `provider`, `baseUrl`, `apiKey`, `model`, `temperature`, `maxTokens`.
- `WorldLore`: `title`, `genre`, `summary`, `rules`, `factions`, `currentLocation`.
- `CharacterProfile`: `name`, `role`, `description`, `inventory`, `status`.
- `Message`: `id`, `sender` ('user' | 'assistant' | 'system'), `content`, `timestamp`.
- `Campaign`: `id`, `name`, `phase` ('worldbuilding' | 'roleplay'), `lore`, `player`, `messages`, `createdAt`, `updatedAt`.

### Services (`src/services/aiService.ts`)
- **Universal LLM Client:**
  - Mendukung standar OpenAI Chat Completions API (`POST /v1/chat/completions`) yang kompatibel dengan **OpenAI**, **OpenRouter**, **Groq**, **Ollama**, **LM Studio**, **Together AI**, **DeepSeek**, dan **Google Gemini** (via OpenRouter atau endpoint OpenAI-compatible).
  - Dilengkapi sistem *Smart Simulation Engine* jika pengguna ingin mencoba alur cerita tanpa memasukkan API key.

### Components
1. `src/components/Navbar.tsx`: Navigasi utama, status model AI aktif, tombol switch campaign, dan toggle *World Codex*.
2. `src/components/WorldbuildingWizard.tsx`: Antarmuka interaktif pemandu semesta. Membantu pemain mendiskusikan dunia, geografi, dan sistem cerita dengan AI, lalu mengompilasinya menjadi lorebook dengan satu klik.
3. `src/components/RoleplayArena.tsx`: Ruang utama cerita dengan parser narasi otomatis (`*tindakan*` dan `"dialog"`), auto-scroll, message action bar (edit, delete, retry), dan prompt input dengan action modifiers.
4. `src/components/WorldCodexDrawer.tsx`: Pustaka catatan dunia hidup yang dapat diedit langsung oleh pemain.
5. `src/components/SettingsModal.tsx`: Pengaturan konfigurasi custom endpoint, API key, model selector, dan parameter model.
6. `src/components/CampaignModal.tsx`: Daftar semesta/kampanye cerita, buat baru, hapus, dan tombol Export/Import JSON.

## 3. UI/UX Design System (`src/index.css`)
- Menggunakan palet gelap elegan bertema *Arcane Obsidian & Slate* dengan aksen emas/cyan lembut.
- Tipografi narasi menggunakan font yang nyaman dibaca untuk teks panjang.
- Animasi transisi halus pada pembukaan drawer dan pesan chat baru.

## 4. Verification & Testing Strategy
- [ ] Validasi inisialisasi project Vite + TypeScript.
- [ ] Uji coba multi-provider API request (OpenRouter / Ollama / OpenAI / Mock).
- [ ] Uji alur transisi dari Worldbuilding ke Roleplay Mode.
- [ ] Uji format pemisahan dialog vs narasi tindakan di chat.
- [ ] Uji persistensi data ke `localStorage` (refresh browser data tetap utuh).
- [ ] Uji fitur export & import file JSON.
