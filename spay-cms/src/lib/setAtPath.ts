/**
 * Immutable deep set by dotted path. Mirror of spay-website/src/lib/setAtPath.ts.
 *
 * `setAtPath(obj, "hero.titleParts.1.text", "MONEY ")` returns a NEW object with
 * that leaf replaced and every container along the way shallow-copied. Numeric
 * path segments address array indices.
 *
 * Used by the homepage inline editor: an edit posted from the live-preview
 * iframe is applied to the resolved `sections` object by path, then saved.
 */
export function setAtPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');

  const clone = (node: unknown, depth: number): unknown => {
    const key = keys[depth];
    const isLast = depth === keys.length - 1;

    const next: Record<string, unknown> = Array.isArray(node)
      ? (node.slice() as unknown as Record<string, unknown>)
      : { ...((node as Record<string, unknown>) ?? {}) };

    if (isLast) {
      next[key] = value;
      return next;
    }

    const child = next[key];
    const childSeed = child ?? (/^\d+$/.test(keys[depth + 1]) ? [] : {});
    next[key] = clone(childSeed, depth + 1);
    return next;
  };

  return clone(obj, 0) as T;
}
