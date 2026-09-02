import { describe, it, expect } from 'vitest';
import { renderFormattedMessage } from '../utils/messageParser';

describe('Message Parser & Narrative Formatter Regression Tests', () => {
  it('handles null or empty strings gracefully without crashing', () => {
    expect(renderFormattedMessage('')).toBeNull();
  });

  it('renders standard text and extracts action tokens correctly', () => {
    const rawText = '*Dia melangkah ke depan dan tersenyum pelan.*';
    const result = renderFormattedMessage(rawText);
    expect(result).toBeDefined();
  });

  it('extracts dialogue inside quotation marks correctly', () => {
    const rawText = '"Jangan melangkah lebih jauh," bisik sosok misterius itu.';
    const result = renderFormattedMessage(rawText);
    expect(result).toBeDefined();
  });

  it('handles mixed lines containing both actions, quotes, and bold text', () => {
    const rawText = `*Pedang di tangannya bersinar terang.* "Kita harus pergi **sekarang**!" *teriak Kael.*`;
    const result = renderFormattedMessage(rawText);
    expect(result).toBeDefined();
  });

  it('handles multiline narratives with empty lines', () => {
    const rawText = `Paragraf pertama.\n\n*Paragraf kedua aksi.*`;
    const result = renderFormattedMessage(rawText);
    expect(result).toBeDefined();
  });
});
