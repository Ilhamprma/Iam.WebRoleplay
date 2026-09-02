/**
 * Robust JSON extraction utility to safely parse JSON from LLM responses,
 * preventing "Unexpected non-whitespace character after JSON" or markdown wrapping errors.
 */

function tryParseJson<T>(str: string): T | null {
  if (!str || typeof str !== 'string') return null;
  try {
    return JSON.parse(str);
  } catch {
    try {
      // Clean trailing commas (e.g. `[1, 2,]` or `{"a": 1,}`) and comments
      const cleaned = str
        .replace(/,\s*([\}\]])/g, '$1')
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
        .trim();
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

/**
 * Safely extracts and parses the first valid JSON object or array from a string,
 * ignoring leading/trailing markdown, extra commentary text, and unescaped notes.
 */
export function extractJsonFromText<T = any>(text: string, fallback: T): T {
  if (!text || typeof text !== 'string') return fallback;

  // 1. Check for markdown code blocks (```json ... ``` or ``` ... ```)
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const candidate = match[1].trim();
    const parsed = tryParseJson<T>(candidate);
    if (parsed !== null) return parsed;
  }

  // 2. Scan for the first outermost balanced object `{ ... }` or array `[ ... ]`
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');

  let startIdx = -1;
  let isObject = true;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    isObject = true;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    isObject = false;
  }

  if (startIdx !== -1) {
    const openChar = isObject ? '{' : '[';
    const closeChar = isObject ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === openChar) {
          depth++;
        } else if (char === closeChar) {
          depth--;
          if (depth === 0) {
            const candidate = text.slice(startIdx, i + 1);
            const parsed = tryParseJson<T>(candidate);
            if (parsed !== null) return parsed;
            break;
          }
        }
      }
    }
  }

  // 3. Direct parse attempt after trimming
  const directParsed = tryParseJson<T>(text.trim());
  if (directParsed !== null) return directParsed;

  return fallback;
}
