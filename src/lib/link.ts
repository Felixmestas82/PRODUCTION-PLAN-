/** Two job numbers are the same job if they're equal once stringified and
 *  trimmed — handles "47985" vs 47985 vs " 47985 " all matching. */
export function sameJobNo(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): boolean {
  if (a == null || b == null) return false;
  const sa = String(a).trim();
  const sb = String(b).trim();
  return sa !== '' && sa === sb;
}

function normalizeText(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase();
}

/** Same phase and tag, case/whitespace-insensitive. Two records with both
 *  fields blank are NOT considered a match — that's too weak a signal to
 *  link on. */
export function samePhaseTag(
  a: { phase: string | null; tag: string | null },
  b: { phase: string | null; tag: string | null },
): boolean {
  const phase = normalizeText(a.phase);
  const tag = normalizeText(a.tag);
  if (phase === '' && tag === '') return false;
  return phase === normalizeText(b.phase) && tag === normalizeText(b.tag);
}
