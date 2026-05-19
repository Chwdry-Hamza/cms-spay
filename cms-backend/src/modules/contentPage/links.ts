/**
 * Internal-link extraction + rewriting for content page blocks.
 *
 * The same tiny Markdown subset the editor and renderers understand —
 * `[label](url){:newtab}?` — drives both internal-link bookkeeping and slug
 * rename propagation here. Keeping the regex identical across CMS, public
 * site and backend means we never get drift between what an editor types,
 * what gets rendered, and what we track as a backlink.
 */
import type { IBlock } from '../../models/ContentPage';

/**
 * One outgoing internal-link reference. Stored as an array on each
 * ContentPage so the slug-rename + delete-safety flows can answer the
 * "who links to me?" question in a single indexed query.
 */
export interface InternalLinkRef {
  /** Slug of the linked-to page, without the leading slash. */
  targetSlug: string;
  /** The anchor text the editor wrote between `[ ]`. Kept for the
   *  "Pages linking here" panel so the source page is recognizable. */
  anchor: string;
  /** ID of the block that contains this link — lets the UI deep-link
   *  back to the exact paragraph / list item / table cell that needs
   *  attention when a slug changes. */
  blockId: string;
}

/**
 * Markdown link matcher — shared with both renderers (CMS preview +
 * public site). Capture groups:
 *   1 — label
 *   2 — url
 *   3 — `{:newtab}` (ignored here; same-tab/new-tab makes no difference
 *       for backlink tracking)
 */
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)(\{:newtab\})?/g;

/**
 * Normalize an internal-link URL down to a bare slug for indexing.
 *
 * - `/about` → `about`
 * - `/about?utm=x` → `about` (query stripped)
 * - `/about#section` → `about` (fragment stripped)
 * - `https://…` / `mailto:` / `#anchor` / empty → `null` (not internal)
 *
 * Returning `null` for non-internal URLs is what lets callers extract
 * just the in-CMS link graph without doing the type check themselves.
 */
export function normalizeInternalUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith('/')) return null;
  // Strip leading slash, then drop fragment / query — neither affects
  // which page we're targeting for backlink purposes.
  const trimmed = url.slice(1).split(/[?#]/)[0];
  if (!trimmed) return null; // bare `/` is the home, not a content page
  return trimmed;
}

/**
 * Walk every text-bearing field on a block (paragraph.text, list.items,
 * note.text, table.rows cells) and yield each Markdown link occurrence
 * along with its containing blockId. Headings don't run through inline
 * Markdown (the renderer treats `parts[].text` as literal coloured spans),
 * so we skip them. Dividers obviously have no text.
 */
function* linkOccurrencesInBlock(
  block: IBlock,
): Generator<{ label: string; url: string; blockId: string }, void, void> {
  const collect = (text: string | undefined) => text ?? '';
  const fields: string[] = [];
  switch (block.type) {
    case 'paragraph':
    case 'note':
      fields.push(collect(block.text));
      break;
    case 'list':
      for (const it of block.items ?? []) fields.push(it);
      break;
    case 'table':
      for (const row of block.rows ?? []) {
        for (const cell of row) fields.push(cell);
      }
      break;
    // heading / divider: nothing to scan
    default:
      break;
  }

  for (const text of fields) {
    if (!text) continue;
    // Reset the regex's lastIndex so each field is scanned independently.
    LINK_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LINK_RE.exec(text)) !== null) {
      yield { label: m[1], url: m[2], blockId: block.id };
    }
  }
}

/**
 * Extract every internal-link reference from a block array. The order
 * follows block order, then in-text order — useful when surfacing
 * "rewrite preview" diffs later.
 */
export function extractInternalLinks(blocks: IBlock[]): InternalLinkRef[] {
  const out: InternalLinkRef[] = [];
  for (const block of blocks) {
    for (const occ of linkOccurrencesInBlock(block)) {
      const targetSlug = normalizeInternalUrl(occ.url);
      if (!targetSlug) continue;
      out.push({
        targetSlug,
        anchor: occ.label,
        blockId: occ.blockId,
      });
    }
  }
  return out;
}

/**
 * Replace every internal link pointing at `fromSlug` with one pointing at
 * `toSlug` across every text-bearing field of every block. Returns the
 * (possibly identical) new block array plus a count of replacements made
 * so the caller can report "rewrote 7 links across 3 pages" back to the
 * editor.
 *
 * Only the *path* portion of the URL is rewritten — any preserved query
 * string or fragment carries over (so a link to `/about#team` becomes
 * `/about-us#team` after rename). This matters for SEO-tracked deep links.
 */
export function rewriteInternalLinksInBlocks(
  blocks: IBlock[],
  fromSlug: string,
  toSlug: string,
): { blocks: IBlock[]; replacements: number } {
  if (fromSlug === toSlug)
    return { blocks, replacements: 0 };
  let replacements = 0;

  const rewriteText = (text: string | undefined): string | undefined => {
    if (!text) return text;
    return text.replace(LINK_RE, (full, label, url, marker) => {
      // Parse the URL: split into path + (query/fragment) so the suffix
      // survives the slug swap.
      if (!url.startsWith('/')) return full;
      const hashIdx = url.indexOf('#');
      const queryIdx = url.indexOf('?');
      let cutAt = -1;
      if (hashIdx !== -1 && queryIdx !== -1) cutAt = Math.min(hashIdx, queryIdx);
      else cutAt = Math.max(hashIdx, queryIdx);
      const path = cutAt === -1 ? url : url.slice(0, cutAt);
      const suffix = cutAt === -1 ? '' : url.slice(cutAt);
      const slug = path.slice(1); // drop leading `/`
      if (slug !== fromSlug) return full;
      replacements++;
      const newUrl = `/${toSlug}${suffix}`;
      return `[${label}](${newUrl})${marker ?? ''}`;
    });
  };

  const nextBlocks = blocks.map<IBlock>((b) => {
    switch (b.type) {
      case 'paragraph':
      case 'note':
        return { ...b, text: rewriteText(b.text) ?? '' };
      case 'list':
        return {
          ...b,
          items: (b.items ?? []).map((it) => rewriteText(it) ?? ''),
        };
      case 'table':
        return {
          ...b,
          rows: (b.rows ?? []).map((row) =>
            row.map((cell) => rewriteText(cell) ?? ''),
          ),
        };
      default:
        return b;
    }
  });

  return { blocks: nextBlocks, replacements };
}
