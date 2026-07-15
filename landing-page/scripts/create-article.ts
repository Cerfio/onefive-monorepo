/**
 * Publishes a markdown file as a Payload article.
 *
 *   pnpm create-article content/mon-article.md            # crée un brouillon
 *   pnpm create-article content/mon-article.md --publish  # publie directement
 *   pnpm create-article content/mon-article.md --dry-run  # affiche sans écrire
 *
 * Needs DATABASE_URI + PAYLOAD_SECRET in .env.local (plus the R2_* vars if the
 * article carries a local featuredImage to upload).
 *
 * Frontmatter — see content/_TEMPLATE.md for a documented example.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

type Frontmatter = {
  title: string
  description: string
  category: string
  author: string
  featuredImage: string
  slug?: string
  tags?: string[]
  readTime?: string
  locale?: string
  isFeatured?: boolean
  displayOnNavbar?: boolean
}

const REQUIRED: (keyof Frontmatter)[] = [
  'title',
  'description',
  'category',
  'author',
  'featuredImage',
]

const die = (msg: string): never => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

/**
 * Resolves a relationship by slug/name, or by id when given a number. Lists the
 * valid options on failure — a bad category is the most likely typo, and the
 * whole point is not to have to open the admin to look it up.
 */
const resolveRef = async (
  payload: Payload,
  collection: string,
  field: string,
  value: string,
): Promise<number | string> => {
  const asId = Number(value)
  const where = Number.isInteger(asId) && String(asId) === value
    ? { id: { equals: asId } }
    : { [field]: { equals: value } }

  const { docs } = await payload.find({
    collection: collection as never,
    where: where as never,
    limit: 2,
    depth: 0,
  })

  if (docs.length === 0) {
    const { docs: all } = await payload.find({ collection: collection as never, limit: 50, depth: 0 })
    const options = all.map((d: any) => `  - ${d[field]}`).join('\n')
    die(`Aucun "${value}" dans ${collection}. Valeurs possibles :\n${options || '  (collection vide)'}`)
  }
  if (docs.length > 1) die(`"${value}" est ambigu dans ${collection} — précise l'id.`)

  return (docs[0] as { id: number | string }).id
}

/** ~200 words/min, the usual reading-speed convention. */
const estimateReadTime = (markdown: string): string =>
  `${Math.max(1, Math.round(markdown.split(/\s+/).filter(Boolean).length / 200))} min`

const uploadCover = async (payload: Payload, filePath: string, alt: string) => {
  const buffer = fs.readFileSync(filePath)
  const media = await payload.create({
    collection: 'media',
    data: { alt } as never,
    file: {
      data: buffer,
      mimetype: `image/${path.extname(filePath).slice(1).replace('jpg', 'jpeg')}`,
      name: path.basename(filePath),
      size: buffer.length,
    },
  })
  return media.id
}

const main = async () => {
  const args = process.argv.slice(2)
  const file = args.find((a) => !a.startsWith('--'))
  const publish = args.includes('--publish')
  const dryRun = args.includes('--dry-run')

  if (!file) die('Usage : pnpm create-article <fichier.md> [--publish] [--dry-run]')
  const filePath = path.resolve(file!)
  if (!fs.existsSync(filePath)) die(`Fichier introuvable : ${filePath}`)

  const { data, content: markdown } = matter(fs.readFileSync(filePath, 'utf8'))
  const fm = data as Frontmatter

  const missing = REQUIRED.filter((k) => !fm[k])
  if (missing.length) die(`Frontmatter incomplet — il manque : ${missing.join(', ')}`)
  if (!markdown.trim()) die('Le corps du markdown est vide.')

  const locale = fm.locale || 'fr'
  const payload = await getPayload({ config })

  const [category, author] = await Promise.all([
    resolveRef(payload, 'categories', 'slug', fm.category),
    resolveRef(payload, 'team', 'name', fm.author),
  ])
  const tags = await Promise.all(
    (fm.tags || []).map((t) => resolveRef(payload, 'tags', 'slug', t)),
  )

  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const content = convertMarkdownToLexical({ editorConfig, markdown })

  if (dryRun) {
    console.log('\n--- dry run, rien n’a été écrit ---')
    console.log({
      title: fm.title,
      slug: fm.slug ?? '(dérivé du titre)',
      locale,
      category,
      author,
      tags,
      readTime: fm.readTime || estimateReadTime(markdown),
      status: publish ? 'published' : 'draft',
      cover: fm.featuredImage,
      blocs: (content.root.children as unknown[]).length,
    })
    process.exit(0)
  }

  // The cover is uploaded before the article so a failure here does not leave a
  // half-created article behind — featuredImage is required anyway.
  const coverPath = path.resolve(path.dirname(filePath), fm.featuredImage)
  const featuredImage = fs.existsSync(coverPath)
    ? await uploadCover(payload, coverPath, fm.title)
    : await resolveRef(payload, 'media', 'filename', fm.featuredImage)

  const article = await payload.create({
    collection: 'articles',
    locale: locale as never,
    data: {
      title: fm.title,
      ...(fm.slug ? { slug: fm.slug } : {}),
      description: fm.description,
      content,
      featuredImage,
      category,
      author,
      tags,
      readTime: fm.readTime || estimateReadTime(markdown),
      isFeatured: fm.isFeatured ?? false,
      displayOnNavbar: fm.displayOnNavbar ?? false,
      status: publish ? 'published' : 'draft',
    } as never,
  })

  const { slug } = article as unknown as { slug: string }
  console.log(`\n✓ ${publish ? 'Publié' : 'Brouillon créé'} : ${fm.title}`)
  console.log(`  admin  https://www.onefive.app/studio-9k4x2m/collections/articles/${article.id}`)
  console.log(`  live   https://www.onefive.app/${locale}/blog/${slug}${publish ? '' : '  (une fois publié)'}\n`)
  process.exit(0)
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)))
