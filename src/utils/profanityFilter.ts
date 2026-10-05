/**
 * Small curated word list for catching common profanity in free-text chat
 * answers. Not exhaustive and not a substitute for a dedicated moderation
 * service — good enough to catch casual swearing in the Bartender Bot flow.
 */
const PROFANE_WORDS = new Set([
  'ass',
  'bastard',
  'bitch',
  'cunt',
  'damn',
  'dick',
  'fuck',
  'jackass',
  'motherfucker',
  'pussy',
  'shit',
]);

/** Matches if `value` contains any profane word as a substring, not just a whole word. */
export function containsProfanity(value: string): boolean {
  const normalized = value.toLowerCase();
  return [...PROFANE_WORDS].some((word) => normalized.includes(word));
}
