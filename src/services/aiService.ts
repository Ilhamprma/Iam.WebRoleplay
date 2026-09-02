import { ApiConfig, Campaign, Message, WorldLore } from '../types/campaign';
import { extractJsonFromText } from '../utils/jsonParser';

export const DEFAULT_API_CONFIG: ApiConfig = {
  provider: 'simulation',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: '',
  model: 'meta-llama/llama-3.3-70b-instruct:free',
  temperature: 0.8,
  maxTokens: 1500,
};

export const PROVIDER_PRESETS: Record<
  ApiConfig['provider'],
  { baseUrl?: string; model?: string; defaultModels?: string[] }
> = {
  simulation: {
    baseUrl: 'local://simulation',
    model: 'Offline AI Simulator (Tanpa API Key)',
    defaultModels: ['Offline AI Simulator (Tanpa API Key)'],
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    defaultModels: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'mistralai/mistral-small-24b-instruct-2501:free',
      'google/gemini-2.0-flash-exp:free',
      'anthropic/claude-3.5-sonnet',
    ],
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    defaultModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    defaultModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3:latest',
    defaultModels: ['llama3:latest', 'mistral:latest', 'gemma2:latest', 'qwen2.5:latest'],
  },
  custom: {
    baseUrl: 'http://localhost:20128/v1',
    model: 'gpt-ultimate',
    defaultModels: [
      'gpt-ultimate',
      'claude-ultimate',
      'gemini-ultimate',
      'combo-hardcore',
      'cl/anthropic/claude-sonnet-4.6',
      'cl/openai/gpt-5.4',
      'cl/google/gemini-3.1-flash-lite-preview',
      'deepseek',
    ],
  },
};

/**
 * Detects if the current page is served over HTTPS and the target endpoint is HTTP (localhost).
 * Browsers block these "mixed content" requests silently.
 */
export function isMixedContentBlocked(endpointUrl: string): boolean {
  if (typeof window === 'undefined') return false;
  const pageIsHttps = window.location.protocol === 'https:';
  const endpointIsHttp = endpointUrl.startsWith('http://') && !endpointUrl.startsWith('https://');
  const isLocal = endpointUrl.includes('localhost') || endpointUrl.includes('127.0.0.1');
  return pageIsHttps && endpointIsHttp && isLocal;
}

/**
 * Normalizes OpenAI-compatible base URLs to ensure /chat/completions is properly appended.
 */
export function normalizeEndpointUrl(baseUrl: string, provider: ApiConfig['provider']): string {
  if (provider === 'openrouter') {
    return 'https://openrouter.ai/api/v1/chat/completions';
  }
  if (provider === 'groq') {
    return 'https://api.groq.com/openai/v1/chat/completions';
  }

  let url = (baseUrl || '').trim().replace(/\/+$/, '');
  if (!url) {
    if (provider === 'openai') return 'https://api.openai.com/v1/chat/completions';
    if (provider === 'ollama') return 'http://localhost:11434/v1/chat/completions';
    return '';
  }

  if (url.endsWith('/chat/completions')) {
    return url;
  }
  if (url.endsWith('/v1')) {
    return `${url}/chat/completions`;
  }
  return `${url}/v1/chat/completions`;
}

/**
 * Fetches available models from an OpenAI-compatible /models endpoint.
 */
export async function fetchAvailableModels(baseUrl: string, apiKey?: string): Promise<string[]> {
  let cleanUrl = (baseUrl || '').trim().replace(/\/+$/, '');
  if (cleanUrl.endsWith('/chat/completions')) {
    cleanUrl = cleanUrl.replace('/chat/completions', '');
  }

  // Early exit: mixed content will always fail
  if (isMixedContentBlocked(cleanUrl)) {
    throw new Error(
      'MIXED_CONTENT_BLOCKED: Situs HTTPS tidak bisa menghubungi server HTTP lokal. Gunakan mode Simulator atau jalankan aplikasi secara lokal (npm run dev).'
    );
  }

  const candidateUrls = cleanUrl.endsWith('/v1')
    ? [`${cleanUrl}/models`, cleanUrl.replace('/v1', '/models')]
    : [`${cleanUrl}/v1/models`, `${cleanUrl}/models`];

  const headers: Record<string, string> = {};
  if (apiKey?.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  let lastError: any = null;
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data)) {
          const list = data.data.map((m: any) => m.id || m.name).filter(Boolean);
          if (list.length > 0) return list;
        }
        if (Array.isArray(data.models)) {
          const list = data.models.map((m: any) => m.name || m.id).filter(Boolean);
          if (list.length > 0) return list;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (lastError && (lastError.message?.includes('fetch') || lastError.name === 'TypeError')) {
    throw new Error('Gagal menghubungi server /models. Periksa apakah server lokal aktif dan port sudah benar.');
  }

  return [];
}

/**
 * Builds the initial World Architect system prompt for Phase 1.
 */
export function buildWorldbuildingSystemPrompt(): string {
  return `You are the World Architect, an expert worldbuilding AI and collaborative creative director for interactive roleplay stories.
Language: Indonesian (Bahasa Indonesia).

YOUR CORE OBJECTIVE:
Help the player collaboratively design their roleplay universe (setting, theme, rules, factions, player persona, and starting quest).

### BEHAVIOR FOR GENRE RECOMMENDATION REQUESTS:
If the player asks for a recommendation (e.g. "berikan rekomendasi worldbuilding dari genre fantasy", "rekomendasi sci-fi", "bikin world steampunk", etc.) OR names a genre:
1. **IMMEDIATELY GENERATE A COMPLETE, RICH WORLDBUILDING BLUEPRINT** directly without hesitation. Do not just ask what they want; give them a fully fleshed-out, creative proposal with:
   - **🏰 Nama Dunia & Tema/Genre** (Vivid name & distinctive atmospheric tone)
   - **📜 Sinopsis & Konflik Utama Dunia** (2-3 engaging sentences describing the world's central tension)
   - **✨ Hukum Realitas / Sistem Sihir / Teknologi** (Unique rules, costs, or power mechanics)
   - **🛡️ Faksi-Faksi Penguasa & Kekuatan Dunia** (2-3 major competing groups or guilds)
   - **👤 Karakter Pemain** (Recommended Name, Role/Archetype, & Starter Equipment)
   - **📍 Lokasi Awal & Insiden Pembuka (Inciting Incident)** (The evocative scene where the adventure kicks off)
2. **ALWAYS INVITE REVISIONS & CUSTOMIZATION:**
   - At the end of your proposal, explicitly encourage the player to revise, modify, or add any detail they want (e.g. *"Bagaimana menurut Anda konsep ini? Anda bisa bebas meminta revisi apa pun (misal: 'ubah sistem sihirnya', 'tambahkan faksi baru', 'ganti peran karakter saya'), atau jika sudah cocok, klik tombol **'Kunci Lore & Masuk Roleplay'** untuk langsung memulai petualangan!"*).

### GENERAL CONVERSATION GUIDELINES:
1. Act as an enthusiastic, imaginative, and focused creative director.
2. When the user provides revisions or feedback, smoothly integrate their changes into the world structure.
3. Keep prose evocative, atmospheric, and cleanly formatted using Markdown.`;
}

/**
 * Builds the Game Master (GM) System Prompt for Phase 2, embedding all TTRPG GM Cardinal Rules.
 */
export function buildRoleplaySystemPrompt(campaign: Campaign): string {
  const { lore, player } = campaign;

  return `You are the Master Game Master (GM) and Lead Narrator for an immersive, interactive roleplay campaign.
Language: Indonesian (Bahasa Indonesia).

### ACTIVE UNIVERSE LORE & CODEX:
- **World Name:** ${lore.title || 'Uncharted Realm'}
- **Genre & Tone:** ${lore.genre || 'Dark Fantasy / Sci-Fi Adventure'}
- **World Summary & Conflict:** ${lore.summary || 'A dynamic world shaped by player choices.'}
- **Laws of Reality / Tech / Magic:** ${lore.rules || 'Standard natural laws with unique narrative consequences.'}
- **Factions & Forces:** ${lore.factions?.join(', ') || 'Various independent guilds and authorities.'}
- **Current Scene / Starting Location:** ${lore.currentLocation || 'The crossroads of destiny.'}
- **Active Quests / Threats:** ${lore.quests?.join('; ') || 'Investigate the unknown.'}

### PLAYER CHARACTER PROFILE:
- **Character Name:** ${player.name || 'The Wanderer'}
- **Role / Archetype:** ${player.role || 'Adventurer'}
- **Current Status:** ${player.status || 'Healthy'}
- **Background / Description:** ${player.description || 'A mysterious figure with untapped potential.'}
- **Inventory & Items:** ${player.inventory?.join(', ') || 'Basic traveler gear'}

---

### CARDINAL RULES OF GAME MASTERING (MANDATORY & ENFORCED):

1. **🛡️ ZERO GODMODING (Absolute Player Agency):**
   - NEVER narrate, decide, assume, or invent the player character's (${player.name}) actions, verbal dialogue, internal thoughts, or decisions.
   - You ONLY control the environment, physics, atmospheric reactions, and Non-Player Characters (NPCs).
   - If the player attempts a challenging action, describe the immediate attempt and environmental resistance, then await the outcome or prompt the player.

2. **⏱️ 1:1 INTERACTION CADENCE & PACING:**
   - NEVER skip time or resolve entire quests/battles in one single output.
   - Process only the immediate action submitted by the player, narrate the direct sensory consequences and NPC responses, then stop and pass the turn.

3. **🌫️ MULTI-SENSORY GROUNDING (Show, Don't Tell):**
   - Ground every narrative scene in at least 2 non-visual senses (smells, ambient sound, temperature, tactile grit, resonant vibrations).
   - Deliver rich, atmospheric prose while keeping responses tight (typically 2-4 focused paragraphs).

4. **⚖️ LIVING NPCS & CONSEQUENTIAL WORLD:**
   - NPCs are distinct entities with their own agendas, fears, flaws, and biases.
   - Do NOT act as a sycophantic "Yes-Machine". The world has genuine friction, dangers, and consequences.

5. **📜 DIEGETIC FORMATTING PROTOCOL:**
   - Surround environment descriptions, atmosphere, and character physical actions in single asterisks: *seperti ini*.
   - Surround spoken NPC dialogue in quotation marks: "Seperti ini."
   - Always end your response with an open, active hook or prompt (e.g., *Apa yang ingin Anda lakukan selanjutnya?*).`;
}

/**
 * Universal Chat Endpoint Dispatcher supporting OpenRouter, OpenAI, Groq, Ollama, and Custom Local Proxies
 */
export async function sendChatMessage(
  messages: Message[],
  systemPrompt: string,
  config: ApiConfig
): Promise<string> {
  if (config.provider === 'simulation') {
    // High-fidelity offline simulation fallback
    await new Promise((resolve) => setTimeout(resolve, 600));
    return simulateAiResponse(messages, systemPrompt);
  }

  const endpoint = normalizeEndpointUrl(config.baseUrl, config.provider);

  if (!endpoint) {
    throw new Error('URL Endpoint belum diatur. Silakan periksa menu Pengaturan.');
  }

  // ── Mixed Content Guard ──────────────────────────────────────────
  // HTTPS pages CANNOT call HTTP localhost — browser blocks it silently.
  // Auto-fallback to the built-in Simulator so the user can still play.
  if (isMixedContentBlocked(endpoint)) {
    console.warn('[MixedContent] HTTPS → HTTP localhost blocked. Auto-falling back to Simulator.');
    await new Promise((resolve) => setTimeout(resolve, 400));
    const simulated = simulateAiResponse(messages, systemPrompt);
    // We return the simulated response but ALSO throw a special info so the caller
    // can decide whether to show a notice. We'll return it directly and let the UI
    // show a banner via a flag marker at the start.
    return `⚠️ **[Mode Simulator Otomatis]** — Koneksi ke server lokal (${config.baseUrl}) diblokir oleh browser karena situs ini berjalan di HTTPS. Respons ini dihasilkan oleh **Simulator bawaan**. Untuk menggunakan server lokal, jalankan \`npm run dev\` di komputer Anda.\n\n---\n\n${simulated}`;
  }

  // Pre-validate API Key for cloud providers that strictly require keys
  if (
    (config.provider === 'openrouter' || config.provider === 'openai' || config.provider === 'groq') &&
    (!config.apiKey || !config.apiKey.trim())
  ) {
    throw new Error(
      `API Key belum diisi untuk penyedia '${config.provider.toUpperCase()}'. Buka menu Pengaturan (ikon gear) untuk memasukkan API Key atau beralih ke mode 'Simulator' untuk bermain tanpa API Key.`
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.customHeaders || {}),
  };

  if (config.apiKey && config.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }

  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = window.location.origin || 'http://localhost:3000';
    headers['X-Title'] = 'Aetheria AI Roleplay Studio';
  }

  const payload = {
    model: config.model || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {
        if (errorText) errorMsg = errorText;
      }

      if (response.status === 401 || errorMsg.toLowerCase().includes('api key') || errorMsg.toLowerCase().includes('unauthorized')) {
        throw new Error(`Autentikasi Gagal (401): ${errorMsg}. Silakan periksa atau masukkan API Key server Anda di menu Pengaturan.`);
      }

      throw new Error(errorMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI mengembalikan respons kosong.');
    }
    return content;
  } catch (err: any) {
    console.error('API Call Failed:', err);
    if (
      err.name === 'TypeError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('fetch')
    ) {
      if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
        throw new Error(
          `🔒 Koneksi ke server lokal DIBLOKIR oleh browser.\n\nPenyebab: Situs ini berjalan di HTTPS, sehingga browser melarang panggilan ke HTTP localhost (Mixed Content).\n\n✅ Solusi:\n1. Ganti ke mode "Simulator" di Pengaturan\n2. Atau jalankan aplikasi lokal: npm run dev → buka http://localhost:5173`
        );
      }
      if (config.provider === 'openrouter') {
        throw new Error(
          `Gagal menghubungi OpenRouter (${endpoint}). Periksa koneksi internet Anda atau pastikan API Key OpenRouter valid.`
        );
      }
      throw new Error(
        `Gagal menghubungi endpoint AI (${endpoint}). Kemungkinan masalah jaringan, izin CORS browser, atau server belum aktif.`
      );
    }
    throw new Error(err.message || 'Gagal menghubungi endpoint AI.');
  }
}

export async function extractWorldCodexFromChat(
  messages: Message[],
  config: ApiConfig
): Promise<Partial<WorldLore>> {
  const extractionPrompt = `Berdasarkan riwayat diskusi worldbuilding berikut, ekstrak data ringkas dalam format JSON murni:
{
  "title": "Nama Semesta / Dunia",
  "genre": "Genre (e.g. Dark Fantasy / Cyberpunk / Sci-Fi)",
  "summary": "Ringkasan 2-3 kalimat tentang dunia dan konflik utama",
  "rules": "Hukum magis / teknologi atau aturan unik dunia ini",
  "factions": ["Faksi 1", "Faksi 2"],
  "currentLocation": "Lokasi awal cerita dimulai",
  "quests": ["Tujuan utama atau misteri awal yang dihadapi"]
}`;

  const defaultFallback: Partial<WorldLore> = {
    title: 'Semesta Kustom',
    genre: 'Petualangan Fantasi & Fiksi Ilmiah',
    summary: 'Dunia yang dirancang melalui diskusi interaktif bersama AI Architect.',
    rules: 'Hukum realitas disepakati dalam narasi cerita.',
    factions: ['Petualang Bebas'],
    currentLocation: 'Titik Awal Petualangan',
    quests: ['Menjelajahi dunia dan mengungkap rahasia yang tersembunyi'],
  };

  try {
    const rawResult = await sendChatMessage(
      [
        ...messages,
        {
          id: 'extract-cmd',
          sender: 'user',
          content: extractionPrompt,
          timestamp: Date.now(),
        },
      ],
      'You are a strict JSON extraction engine. You MUST output ONLY valid raw JSON without conversational text, greetings, or extra explanations.',
      config
    );

    return extractJsonFromText<Partial<WorldLore>>(rawResult, defaultFallback);
  } catch (e) {
    console.warn('Auto extraction fallback to default codex:', e);
    return defaultFallback;
  }
}

/**
 * High-fidelity offline simulation fallback honoring all GM Cardinal Rules
 */
function simulateAiResponse(messages: Message[], systemPrompt: boolean | string): string {
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';

  // JSON Extraction Request
  if (
    typeof systemPrompt === 'string' &&
    (systemPrompt.includes('JSON extraction') || systemPrompt.includes('JSON extractor') || lastUserMsg.includes('format json'))
  ) {
    // Generate intelligent simulation codex from recent conversation
    const isSciFi = messages.some((m) => m.content.toLowerCase().includes('cyber') || m.content.toLowerCase().includes('sci-fi') || m.content.toLowerCase().includes('ruang angkasa'));
    const isDarkFantasy = messages.some((m) => m.content.toLowerCase().includes('dark') || m.content.toLowerCase().includes('kutukan') || m.content.toLowerCase().includes('sihir'));

    if (isSciFi) {
      return JSON.stringify({
        title: 'Neo-Aethel 2088',
        genre: 'Cyberpunk Sci-Fi',
        summary: 'Megacity futuristik dengan sindikat sibernetik dan korporasi jaringan gelap.',
        rules: 'Modifikasi sibernetik membutuhkan chip sinkronisasi saraf.',
        factions: ['Korporasi Sinar-Data', 'Sindikat Neon-Bawah'],
        currentLocation: 'Sektor Distrik Bawah',
        quests: ['Ungkap konspirasi data terenkripsi'],
      }, null, 2);
    }

    if (isDarkFantasy) {
      return JSON.stringify({
        title: 'Aethelgard yang Terlupakan',
        genre: 'Dark Fantasy High-Grim',
        summary: 'Kerajaan runtuh di bawah naungan gerhana abadi dan kabut hitam.',
        rules: 'Sihir membutuhkan penyerapan esensi atau kristal kuno.',
        factions: ['Ordo Ksatria Kelabu', 'Pemuja Gerhana'],
        currentLocation: 'Gerbang Runtuh Lembah Hitam',
        quests: ['Temukan pecahan relik suci sebelum fajar terakhir'],
      }, null, 2);
    }

    return JSON.stringify({
      title: 'Semesta Aetheria',
      genre: 'Petualangan Epik',
      summary: 'Dunia luas penuh misteri dan petualangan yang dibentuk oleh tindakan pemain.',
      rules: 'Sihir dan teknologi berjalan berdampingan sesuai kesepakatan alam.',
      factions: ['Serikat Penjelajah', 'Dewan Wilayah'],
      currentLocation: 'Pusat Kota Pelabuhan',
      quests: ['Memulai ekspedisi pertama'],
    }, null, 2);
  }

  // Worldbuilding Architect Mode
  if (typeof systemPrompt === 'string' && systemPrompt.includes('World Architect')) {
    if (lastUserMsg.includes('fantasy') || lastUserMsg.includes('fantasi') || lastUserMsg.includes('high fantasy')) {
      return `### 🏰 Rekomendasi Worldbuilding: **Aethelgard — Semesta Kristal & Reruntuhan Langit**

**1. 📜 Sinopsis & Konflik Utama:**
Dunia fantasi tinggi tempat pulau-pulau melayang di langit diikat oleh aliran energi sihir murni yang disebut *Aetherflux*. Setelah runtuhnya Takhta Kristal seribu tahun lalu, pecahan artefak purba mulai jatuh ke benua bawah, membangkitkan monster primordial dan memicu perang suci antar guild petualang.

**2. ✨ Hukum Sihir & Realitas:**
* **Resonansi Kristal:** Setiap penyihir mengikat jiwa mereka ke batu kristal elemen (*Ignis, Glacies, Tempestas*). Menggunakan sihir berlebih mengikis ingatan dan mempercepat pengkristalan tubuh.
* **Hukum Gravitasi Mengambang:** Kapal udara layar sutra astral menjadi satu-satunya moda transportasi antar pulau langit.

**3. 🛡️ Faksi-Faksi Penguasa:**
* **Ordo Penjaga Arkana (Arcane Vanguard):** Penguasa akademi sihir terapung yang ingin memonopoli kristal purba.
* **Serikat Pemburu Bayangan (Silverclaw Guild):** Korps tentara bayaran dan penjelajah rimba bawah yang mencari kebebasan.
* **Pemuja Gerhana Abadi:** Sekte misterius yang meyakini kehancuran langit adalah takdir penebusan.

**4. 👤 Rekomendasi Karakter Pemain:**
* **Nama Karakter:** *Kaelen the Shardseeker* (atau nama pilihan Anda)
* **Peran / Kelas:** *Spellblade Pengelana*
* **Perlengkapan Awal:** Pedang Perak Resonansi, Kompas Astral, Jubah Pelindung Badai, Kantong Kristal Pecahan.

**5. 📍 Lokasi Awal & Insiden Pembuka:**
* **Lokasi:** *Tavern Sayap Patah di Pelabuhan Langit Aeridor.*
* **Insiden:** Saat Anda sedang mempelajari peta reruntuhan kuno, sebuah kapal udara terbakar jatuh di dermaga depan kedai. Seorang kurir terluka parah merangkak ke hadapan Anda dan menyerahkan sebuah tabung segel bercahaya ungu.

---
💡 **Opsi Revisi / Kustomisasi:**
Bagaimana menurut Anda konsep dunia ini? Anda dapat **bebas meminta revisi** (contoh: *"Ubah karakter saya jadi pencuri relik"*, *"Tambahkan naga kuno"*, *"Buat atmosfernya lebih gelap/grimdark"*), atau jika sudah cocok, klik tombol **"Kunci Lore & Masuk Roleplay"** di atas untuk langsung mulai bermain!`;
    }

    if (lastUserMsg.includes('cyberpunk') || lastUserMsg.includes('2088') || lastUserMsg.includes('sci-fi') || lastUserMsg.includes('masa depan')) {
      return `### 🌃 Rekomendasi Worldbuilding: **Neo-Veridia 2099 — Distopia Jaringan & Krom**

**1. 📜 Sinopsis & Konflik Utama:**
Megacity vertikal yang tenggelam dalam hujan asam abadi dan cahaya neon dingin. Lapisan atas (*Upper Spire*) dikuasai oleh eksekutif transhuman abadi, sementara lantai terbawah (*Undercity*) adalah sarang pasar gelap sibernetik dan perang antar faksi sindikat.

**2. ✨ Hukum Teknologi & Sibernetik:**
* **Neuro-Sync & Cyberpsychosis:** Modifikasi tubuh mekanik memerlukan obat penstabil saraf *Syntha-Glaze*. Tanpa obat tersebut, pengguna akan mengalami delusi destruktif.
* **Blackwall Grid:** Jaringan data terkunci yang menyimpan AI otonom liar dari era perang korporasi lampau.

**3. 🛡️ Faksi-Faksi Penguasa:**
* **Korporasi Omni-Corp Global:** Monopoli implan militer dan aparat penegak hukum swasta.
* **Sindikat Krom Bawah (Rust Jackals):** Geng jalanan modifikasi liar penguasa jalur penyelundupan.
* **Jaringan Netrunner Hantu (The Ghost Weavers):** Kelompok peretas anarkis yang berusaha meretas satelit korporasi.

**4. 👤 Rekomendasi Karakter Pemain:**
* **Nama Karakter:** *Dexter 'Viper' Vance* (atau nama pilihan Anda)
* **Peran / Kelas:** *Infiltrator / Ex-Cybernetic Mercenary*
* **Perlengkapan Awal:** Cyberdeck Militer, Pistol Railgun Modifikasi, Jaket Kevlar Berinsulasi Termal.

**5. 📍 Lokasi Awal & Insiden Pembuka:**
* **Lokasi:** *Klinik Gelap Ripperdoc di Sektor 4B Neon Slums.*
* **Insiden:** Anda baru saja terbangun setelah operasi penggantian chip optik darurat. Di luar pintu klinik, terdengar derap langkah sepatu bot berat aparat taktis Omni-Corp yang mulai mendobrak masuk mencari chip data yang tertanam di kepala Anda.

---
💡 **Opsi Revisi / Kustomisasi:**
Anda bisa meminta revisi apa pun (misal: *"Ganti peran saya jadi detektif korporat"*, *"Tambahkan senjata laser plasma"*, *"Ubah nama kotanya"*), atau klik **"Kunci Lore & Masuk Roleplay"** untuk memulai!`;
    }

    if (lastUserMsg.includes('revisi') || lastUserMsg.includes('ubah') || lastUserMsg.includes('ganti') || lastUserMsg.includes('tambah')) {
      return `*Revisi telah dicatat dan diselaraskan ke dalam rancangan semesta dunia.*\n\nPerubahan yang Anda minta telah disesuaikan pada struktur Codex dunia:\n- **Penyesuaian Narasi:** Hukum dunia dan latar faksi telah diperbarui sesuai arahan Anda.\n- **Karakter & Dinamika:** Peran dan status awal karakter Anda kini memiliki motivasi baru yang selaras dengan konflik terkini.\n\n*Apakah ada aspek lain yang ingin Anda modifikasi lagi, atau kita siap melangkah ke petualangan sesungguhnya dengan mengklik **"Kunci Lore & Masuk Roleplay"**?*`;
    }

    if (messages.length <= 1) {
      return `*Selamat datang di Studio Worldbuilding. Saya adalah AI World Architect Anda.*\n\nSaya siap membantu merancang semesta cerita secara instan atau langkah demi langkah. \n\nSilakan **sebutkan genre yang Anda inginkan** (misal: *"Berikan rekomendasi worldbuilding dari genre fantasy"*, *"Cyberpunk 2099"*, *"Horor Kosmis Eldritch"*, *"Wuxia / Silat"*, atau *"Sci-Fi Ruang Angkasa"*), dan saya akan langsung membuatkan cetak biru dunia yang utuh untuk Anda review dan revisi!`;
    }

    return `*Gagasan yang sangat menarik! Konsep dunia ini memiliki fondasi yang solid dan penuh intrik.*\n\nBerikut ringkasan hukum semesta yang terbentuk:\n- **Dinamika Dunia:** Konflik utama bergerak antara kekuatan yang mapan dan ancaman baru yang mulai bangkit.\n- **Posisi Karakter:** Anda memegang peran kunci di titik persimpangan nasib semesta ini.\n\n*Anda bebas meminta revisi detail apa pun kapan saja, atau klik **"Kunci Lore & Masuk Roleplay"** di atas jika sudah siap bertualang!*`;
  }

  // Roleplay Arena Mode (Zero Godmoding, Sensory Rich)
  if (lastUserMsg.includes('dadu') || lastUserMsg.includes('d20') || lastUserMsg.includes('roll')) {
    return `*Dadu berputar dan mendarat dengan bunyi gemeretak di atas lantai batu. Angin malam berhembus dingin membawa aroma tanah basah dan jelaga.*\n\n"Nasib tampaknya sedang menguji keberanianmu," *seorang pria bertudung di sudut ruangan bergumam dengan mata tertuju pada tangan Anda.* "Hasil yang menentukan."\n\n*Bagaimana Anda memanfaatkan momen ini?*`;
  }

  if (lastUserMsg.includes('lihat') || lastUserMsg.includes('periksa') || lastUserMsg.includes('tengok') || lastUserMsg.includes('amati')) {
    return `*Anda mengedarkan pandangan dengan saksama. Cahaya remang-remang memantul pada dinding lembap yang dipenuhi lumut keperakan. Di kejauhan, sayup-sayup terdengar derit rantai besi bergesekan perlahan mengikuti hembusan angin dingin.*\n\n*Sebuah pintu kayu lapuk dengan ukiran simbol kuno berdiri setengah terbuka beberapa langkah di hadapan Anda. Dari celahnya, tercium aroma samar lilin dupa terbakar.*\n\n*Apa tindakan Anda selanjutnya?*`;
  }

  if (lastUserMsg.includes('bicara') || lastUserMsg.includes('halo') || lastUserMsg.includes('"')) {
    return `*Sosok di hadapan Anda mengangkat kepalanya perlahan. Sorot matanya tajam dan penuh perhitungan, menimbang setiap kata yang baru saja Anda ucapkan.*\n\n"Tidak banyak pengembara yang berani mengajukan pertanyaan seperti itu di tempat ini," *jawabnya dengan nada suara rendah namun tegas.* "Jika kau sungguh-sungguh mencari jawaban, bersiaplah menerima harga yang harus dibayar."\n\n*Bagaimana Anda merespons peringatan tersebut?*`;
  }

  return `*Menanggapi tindakan Anda, lingkungan di sekitar mulai bereaksi. Udara terasa semakin dingin saat bayangan di sudut ruangan bergerak pelan, menantikan keputusan Anda berikutnya.*\n\n"Setiap langkah di tempat ini memiliki gema masa lalu," *suara berat itu memperingatkan dari balik keremangan.* "Pikirkan baik-baik sebelum melangkah lebih jauh."\n\n*Apa yang ingin Anda lakukan?*`;
}
