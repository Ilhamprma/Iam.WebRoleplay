# Feature Specification: AI Roleplay & Dynamic Worldbuilding Studio

## 1. Overview & Objective
Membangun aplikasi web personal modern menggunakan framework reaktif (React + Vite + TypeScript) untuk pengalaman bermain peran (*roleplay*) berbasis AI dengan alur dua tahap:
1. **Fase Worldbuilding & Universe Setup:** AI berperan sebagai *Architect / Game Master* yang membantu pengguna merancang dunia, lore, faksi, karakter, aturan realitas, dan premis cerita secara interaktif.
2. **Fase Roleplay Narrative Arena:** Setelah worldbuilding tuntas, cerita beralih ke mode bermain peran imersif dengan dialog, aksi, sistem inventaris/catatan dunia dinamis, dan respons AI yang terikat pada lore yang telah dibangun.

Aplikasi mendukung konfigurasi **Multi-Provider & Custom API Endpoints** (OpenAI, OpenRouter, Google Gemini, Anthropic, Groq, Ollama / LM Studio Lokal, atau custom base URL apa pun) dengan penyimpanan data 100% lokal di browser pengguna.

## 2. User Stories
- **Sebagai** pengguna / roleplayer,
- **Saya ingin** dibimbing oleh AI dalam sesi *Worldbuilding* interaktif untuk membangun premis dunia baru dari nol (latar belakang, faksi, sihir/teknologi, karakter kunci),
- **Sehingga** saya tidak perlu membuat seluruh detail secara manual dari awal.

- **Sebagai** pengguna,
- **Saya ingin** berpindah dengan mulus dari sesi Worldbuilding ke sesi *Active Roleplay*,
- **Sehingga** AI mengingat seluruh aturan dunia, relasi karakter, dan tujuan misi yang telah disepakati.

- **Sebagai** pengguna,
- **Saya ingin** memasukkan endpoint API custom (Base URL, API Key, Model ID, dan Header),
- **Sehingga** saya bebas berganti-ganti model AI (Gemini Flash, Claude 3.5, GPT-4o, DeepSeek, Llama 3 lokal, dll.).

- **Sebagai** pengguna,
- **Saya ingin** memiliki panel *World Memory & Codex* yang mencatat rangkuman dunia, inventaris, dan status karakter yang dapat diedit kapan saja,
- **Sehingga** cerita tetap konsisten dan tidak terjadi amnesia konteks saat cerita berjalan panjang.

## 3. Functional Requirements (FR)
- **FR-01 (Custom API & Model Engine Manager):**
  - Konfigurasi profil model: Base URL (contoh: `https://openrouter.ai/api/v1`, `https://api.openai.com/v1`, `http://localhost:11434/v1`), API Key, Model ID (contoh: `gemini-2.0-flash`, `gpt-4o-mini`, `deepseek/deepseek-chat`, `llama3.2`), Temperature, dan Max Tokens.
  - Test Connection button untuk memvalidasi endpoint.
  - Mendukung mode simulasi offline (*Offline Simulation*).
- **FR-02 (Interactive Worldbuilding Wizard):**
  - AI Architect Chatbot yang mengajukan pertanyaan terstruktur bertahap (Tema, Era, Konflik Utama, Karakter Pengguna, dan Titik Mulai Cerita).
  - Tombol "Generate World Brief" / "Mulai Roleplay Sekarang" untuk mengompilasi hasil diskusi menjadi *Master Codex*.
- **FR-03 (Immersive Roleplay Narrative Arena):**
  - Streaming respons teks AI secara halus (*real-time typing effect*).
  - Parser narasi otomatis: Teks tindakan (`*tindakan/ekspresi*`) diformat miring dengan kontras halus, sedangkan ucapan/dialog (`"kalimat ucapan"`) diformat tebal dan menonjol.
  - Action Tools: Edit pesan, Regenerate balasan, Hapus giliran, atau Berikan instruksi langsung ke GM (*Whisper to GM / System Note*).
- **FR-04 (Living World Codex / Lorebook Drawer):**
  - Panel samping (*sidebar/drawer*) berisi: Catatan Dunia, Lokasi Saat Ini, Daftar Tokoh yang Ditemui, dan Inventaris/Status Karakter Pemain.
  - Dapat diperbarui secara manual oleh pemain atau diperbarui otomatis oleh AI setelah peristiwa penting.
- **FR-05 (Session & Campaign Manager):**
  - Manajemen multi-kampanye / multi-dunia (membuat semesta baru, mengganti campaign, menghapus, atau duplikasi).
  - Export & Import Campaign ke file `.json`.

## 4. Non-Functional Requirements (NFR)
- **NFR-01 (Tech Stack Modern):** React 18/19, TypeScript, Vite, TailwindCSS / Modern Token System, Lucide Icons, dan state management persisten.
- **NFR-02 (Client-Side Privacy):** 100% data tersimpan di `localStorage` / `IndexedDB` browser pengguna. Tidak ada data chat atau API key yang dikirim ke server pihak ketiga manapun selain endpoint AI yang dikonfigurasi pengguna.
- **NFR-03 (Akselerasi & Ergonomi Visual):** Tampilan dark-mode elegan, kontras tinggi, typography khusus pembacaan narasi panjang, dan tata letak responsif untuk desktop dan mobile.

## 5. Acceptance Criteria
- [ ] **AC-01:** Pengguna dapat menambahkan dan menyimpan custom API endpoint & API Key di modal pengaturan.
- [ ] **AC-02:** Pengguna dapat memulai sesi baru, berinteraksi dengan AI Worldbuilder, dan mengunci lore dunia.
- [ ] **AC-03:** AI di fase Roleplay merespons peran karakter/lingkungan dengan mematuhi seluruh lore yang dibuat pada fase Worldbuilding.
- [ ] **AC-04:** Format `*narasi tindakan*` dan `"dialog"` ter-render dengan pemisahan tipografi yang jelas.
- [ ] **AC-05:** Panel *World Codex* dapat dibuka dan ditutup dengan mulus, menampilkan ringkasan dunia dan catatan petualangan.
- [ ] **AC-06:** Seluruh kampanye, pesan, dan lore tersimpan otomatis saat browser di-refresh.
