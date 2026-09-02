import { describe, it, expect } from 'vitest';
import { extractJsonFromText } from '../utils/jsonParser';

describe('Resilient JSON Parser Tests (Fix unexpected character after JSON)', () => {
  it('parses raw clean JSON correctly', () => {
    const raw = '{"title": "Neo-Jakarta", "genre": "Cyberpunk"}';
    const parsed = extractJsonFromText<Record<string, any>>(raw, {});
    expect(parsed).toEqual({ title: 'Neo-Jakarta', genre: 'Cyberpunk' });
  });

  it('parses JSON with markdown code blocks', () => {
    const raw = '```json\n{\n  "title": "Aethelgard",\n  "genre": "Dark Fantasy"\n}\n```';
    const parsed = extractJsonFromText<Record<string, any>>(raw, {});
    expect(parsed).toEqual({ title: 'Aethelgard', genre: 'Dark Fantasy' });
  });

  it('parses JSON with trailing commentary after the closing brace (fixes Unexpected non-whitespace error)', () => {
    const raw = `Berikut adalah data codex yang diminta:
{
  "title": "Aethelgard",
  "genre": "Dark Fantasy",
  "summary": "Kerajaan kuno.",
  "factions": ["Ordo Ksatria"]
}

Semoga format ini membantu petualangan Anda! Beritahu saya jika ingin menambah detail lainnya.`;

    const parsed = extractJsonFromText<Record<string, any>>(raw, {});
    expect(parsed.title).toBe('Aethelgard');
    expect(parsed.genre).toBe('Dark Fantasy');
    expect(parsed.factions).toEqual(['Ordo Ksatria']);
  });

  it('handles JSON with trailing commas gracefully', () => {
    const raw = `{\n  "title": "Star Realm",\n  "quests": ["Quest 1", "Quest 2",],\n}`;
    const parsed = extractJsonFromText<Record<string, any>>(raw, {});
    expect(parsed.title).toBe('Star Realm');
    expect(parsed.quests).toHaveLength(2);
  });

  it('returns fallback safely when input is totally invalid', () => {
    const raw = 'Maaf, saya tidak dapat membuat JSON saat ini.';
    const fallback = { title: 'Default World' };
    const parsed = extractJsonFromText(raw, fallback);
    expect(parsed).toEqual(fallback);
  });
});
