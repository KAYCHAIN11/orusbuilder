/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS RESOURCE NAMING
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.generation.resource-naming.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

const IRREGULAR_PLURALS: Record<string, string> = {
  analysis: 'analyses',
  child: 'children',
  criterion: 'criteria',
  index: 'indices',
  person: 'people',
};

const UNCOUNTABLE = new Set(['equipment', 'information', 'inventory', 'media', 'series']);

export function splitResourceWords(value: string): string[] {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function pluralizeResourceWord(value: string): string {
  const word = value.toLowerCase();
  if (!word || UNCOUNTABLE.has(word)) return word;
  if (IRREGULAR_PLURALS[word]) return IRREGULAR_PLURALS[word]!;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/fe$/.test(word)) return `${word.slice(0, -2)}ves`;
  if (/f$/.test(word)) return `${word.slice(0, -1)}ves`;
  return `${word}s`;
}

export function toResourcePath(value: string): string {
  const words = splitResourceWords(value);
  if (words.length === 0) return 'items';
  const last = words.length - 1;
  words[last] = pluralizeResourceWord(words[last]!);
  return words.join('-');
}

export function toResourceTable(value: string): string {
  return toResourcePath(value).replace(/-/g, '_');
}

export function toEntityIdentifier(value: string): string {
  const words = splitResourceWords(value);
  if (words.length === 0) return 'item';
  return words[0] + words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}
