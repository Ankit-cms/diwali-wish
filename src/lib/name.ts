export const MAX_NAME_LENGTH = 40;

export interface Greeting {
  /** Recipient of the celebration. */
  name: string;
  /** Optional sender, carried through shared links. */
  from: string;
}

// Letters, combining marks (Indic matras/viramas), digits, spaces and a few name punctuation marks.
// ZWJ/ZWNJ are kept because many Indic scripts need them to shape conjuncts correctly.
const DISALLOWED = /[^\p{L}\p{M}\p{N}\p{Zs}.'’\-\u200C\u200D]/gu;

type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity: 'grapheme' },
) => { segment(input: string): Iterable<{ segment: string }> };

const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
const graphemeSegmenter = Segmenter ? new Segmenter(undefined, { granularity: 'grapheme' }) : null;

/** Splits text into user-perceived characters so Indic syllables and emoji are never broken. */
export function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  return Array.from(text);
}

export function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let name = raw
    .normalize('NFC')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(DISALLOWED, '')
    .replace(/ {2,}/g, ' ')
    .replace(/^[\s.'’\-]+/, '')
    .replace(/[\s'’\-]+$/, '');

  const chars = splitGraphemes(name);
  if (chars.length > MAX_NAME_LENGTH) name = chars.slice(0, MAX_NAME_LENGTH).join('').trim();

  // Capitalise the first letter of each word for scripts that have case; others are unaffected.
  return name
    .split(' ')
    .map((word) => (word ? word.charAt(0).toLocaleUpperCase() + word.slice(1) : word))
    .join(' ');
}

export function isValidName(name: string): boolean {
  return /\p{L}/u.test(name);
}

export type NameError = 'empty' | 'invalid' | null;

export function validateName(raw: string): { name: string; error: NameError } {
  if (!raw.trim()) return { name: '', error: 'empty' };
  const name = sanitizeName(raw);
  return isValidName(name) ? { name, error: null } : { name: '', error: 'invalid' };
}

function cleanParam(value: string | null): string {
  const name = sanitizeName(value ?? '');
  return isValidName(name) ? name : '';
}

export function readGreetingFromUrl(): Greeting {
  try {
    const params = new URLSearchParams(window.location.search);
    return { name: cleanParam(params.get('name')), from: cleanParam(params.get('from')) };
  } catch {
    return { name: '', from: '' };
  }
}

export function writeGreetingToUrl(greeting: Greeting): void {
  try {
    const url = new URL(window.location.href);
    for (const key of ['name', 'from'] as const) {
      if (greeting[key]) url.searchParams.set(key, greeting[key]);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    // History API can be unavailable in sandboxed frames; personalization still works in memory.
  }
}

export function buildShareUrl(greeting: Partial<Greeting>): string {
  const url = new URL(window.location.pathname, window.location.origin);
  if (greeting.name) url.searchParams.set('name', greeting.name);
  if (greeting.from) url.searchParams.set('from', greeting.from);
  return url.toString();
}
