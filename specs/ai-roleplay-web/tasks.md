# Implementation Tasks: AI Roleplay & Dynamic Worldbuilding Studio

## Execution Checklist

- [x] **Task 1: Project Scaffolding & Setup [S]**
  - Inisialisasi Vite + React + TypeScript di direktori proyek.
  - Install dependensi: `lucide-react`, `clsx`, `tailwind-merge`, `typescript`.
  - Setup config `tsconfig.json`, `vite.config.ts`, dan `index.html`.

- [x] **Task 2: Type Definitions & State Storage Engine [S]**
  - Buat `src/types/campaign.ts` untuk Campaign, Lore, Message, API Config.
  - Buat `src/hooks/useCampaignStore.ts` untuk manajemen state reaktif dengan persistensi `localStorage`.

- [x] **Task 3: Universal AI Service Integration [S]**
  - Buat `src/services/aiService.ts` untuk menangani API chat completion dengan dukungan Base URL fleksibel (OpenAI, OpenRouter, Ollama, Groq, Gemini) dan fallback mode simulasi.
  - Buat helper prompt untuk mode Worldbuilder Architect dan mode Roleplay Game Master.

- [x] **Task 4: Core Navigation & Settings UI [P]**
  - Implementasi `src/components/Navbar.tsx` dengan status koneksi model AI.
  - Implementasi `src/components/SettingsModal.tsx` untuk konfigurasi API endpoint dan key.
  - Implementasi `src/components/CampaignModal.tsx` untuk multi-universe manager dan export/import JSON.

- [x] **Task 5: Interactive Worldbuilding Wizard [P]**
  - Implementasi `src/components/WorldbuildingWizard.tsx` yang memandu pemain dari premis kosong hingga menghasilkan Master Lorebook.
  - Tombol aksi: "Kunci Lore & Masuk Roleplay (Lock Lore & Enter Roleplay)".

- [x] **Task 6: Immersive Roleplay Arena & Narrative Formatter [S]**
  - Implementasi `src/components/RoleplayArena.tsx`.
  - Buat parser teks untuk membedakan gaya visual `*tindakan narasi*` vs `"dialog ucapan"`.
  - Action tools: Regenerate, Edit, Delete, Whisper to GM, Roll D20.

- [x] **Task 7: Living World Codex & Lorebook Drawer [P]**
  - Implementasi `src/components/WorldCodexDrawer.tsx` untuk menampilkan dan mengedit catatan dunia, status pemain, dan NPC yang ditemui.

- [x] **Task 8: Styling, Polish & Verification [S]**
  - Implementasi `src/index.css` dengan dark luxury aesthetic (zero-glow, high contrast).
  - Verifikasi seluruh Acceptance Criteria (`AC-01` s/d `AC-06`) dan pengujian build produksi Vite sukses.
