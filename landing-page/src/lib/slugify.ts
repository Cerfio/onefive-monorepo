/**
 * Turns a human title into a URL slug, keeping accented words readable:
 * "L'écosystème connecté" → "lecosysteme-connecte".
 *
 * The previous implementation did `.replace(/[^\w-]+/g, '')`, which dropped
 * accented characters outright ("lcosystme-connect") because é/è/à are not
 * \w — producing URLs that lost their keywords.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD') // é → e + combining acute
    .replace(/[\u0300-\u036f]/g, '') // drop the combining marks
    .replace(/['\u2018\u2019`]/g, '') // l'écosystème → lecosysteme, not l-ecosysteme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * beforeValidate hook for a `slug` field derived from `sourceField`.
 *
 * An explicit slug always wins. Re-deriving on every save would silently
 * rewrite the URL of an already-published doc whenever its title is edited —
 * and, right after a slugify fix like this one, would churn every existing
 * slug at once and break the live links.
 */
export const slugFrom =
  (sourceField: string) =>
  ({ data, value }: { data?: Record<string, unknown>; value?: unknown }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const source = data?.[sourceField]
    return typeof source === 'string' && source.trim() ? slugify(source) : value
  }
