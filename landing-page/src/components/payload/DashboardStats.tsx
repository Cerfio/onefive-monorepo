import type { ServerProps } from 'payload'
import Link from 'next/link'

const ADMIN = '/studio-9k4x2m'

type Stat = {
  label: string
  value: number
  href: string
  hint?: string
  accent?: boolean
}

const countOf = async (
  payload: ServerProps['payload'],
  collection: string,
  where?: Record<string, unknown>,
): Promise<number> => {
  try {
    const { totalDocs } = await payload.count({ collection: collection as never, where })
    return totalDocs
  } catch {
    // A collection can be missing or its table not yet created — a broken
    // counter must never take the whole dashboard down.
    return 0
  }
}

export const DashboardStats = async ({ payload, user }: ServerProps) => {
  if (!payload) return null

  const [published, drafts, waitlist, contact, feedback, bugs, suggestions] = await Promise.all([
    countOf(payload, 'articles', { status: { equals: 'published' } }),
    countOf(payload, 'articles', { status: { not_equals: 'published' } }),
    countOf(payload, 'waitlist'),
    countOf(payload, 'contact', { status: { equals: 'new' } }),
    countOf(payload, 'feedback', { status: { equals: 'new' } }),
    countOf(payload, 'bug-reports', { status: { equals: 'new' } }),
    countOf(payload, 'article-suggestions', { status: { equals: 'pending' } }),
  ])

  const inbox = contact + feedback + bugs + suggestions

  const stats: Stat[] = [
    { label: 'Articles publiés', value: published, href: `${ADMIN}/collections/articles` },
    { label: 'Brouillons', value: drafts, href: `${ADMIN}/collections/articles`, hint: 'à finir' },
    { label: 'Waitlist', value: waitlist, href: `${ADMIN}/collections/waitlist` },
    {
      label: 'À traiter',
      value: inbox,
      href: `${ADMIN}/collections/contact`,
      hint: inbox > 0 ? `${contact} contact · ${feedback} feedback · ${bugs} bugs · ${suggestions} idées` : 'boîte vide',
      accent: inbox > 0,
    },
  ]

  const firstName = typeof user?.email === 'string' ? user.email.split('@')[0] : null

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem' }}>
        {firstName ? `Salut ${firstName} 👋` : 'Onefive Studio'}
      </h2>
      <p style={{ margin: '0 0 1.25rem', color: 'var(--theme-elevation-500)' }}>
        L&apos;état du site en un coup d&apos;œil.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            style={{
              display: 'block',
              padding: '1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              color: 'inherit',
              background: 'var(--theme-elevation-50)',
              border: `1px solid ${s.accent ? 'var(--theme-warning-500)' : 'var(--theme-elevation-100)'}`,
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ marginTop: '0.25rem' }}>{s.label}</div>
            {s.hint && (
              <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--theme-elevation-500)' }}>
                {s.hint}
              </div>
            )}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Link
          href={`${ADMIN}/collections/articles/create`}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            textDecoration: 'none',
            background: 'var(--theme-text)',
            color: 'var(--theme-bg)',
          }}
        >
          + Nouvel article
        </Link>
        {[
          { label: 'Nouvelle release', href: `${ADMIN}/collections/releases/create` },
          { label: 'Voir le blog', href: 'https://www.onefive.app/fr/blog' },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid var(--theme-elevation-150)',
            }}
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
