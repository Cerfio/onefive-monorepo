/**
 * Publishes a markdown file as a Payload article.
 *
 *   pnpm create-article content/mon-article.md                    # crée un brouillon
 *   PUBLISH=1 pnpm create-article content/mon-article.md          # publie directement
 *   DRY_RUN=1 pnpm create-article content/mon-article.md          # affiche sans écrire
 *
 * Flags via variables d'env, pas via --flags : `payload run` avale
 * silencieusement tout argument commençant par "--" avant qu'il n'atteigne
 * ce script (bug côté Payload CLI, indépendant de ce projet).
 *
 * Needs DATABASE_URI + PAYLOAD_SECRET in .env.local (plus the R2_* vars if the
 * article carries a local featuredImage to upload).
 *
 * Frontmatter — see content/_TEMPLATE.md for a documented example.
 *
 * Bilingue : title/slug/description/content sont des champs localisés dans
 * Payload (un seul document, une valeur par locale) — category/author/tags/
 * featuredImage sont partagés. Pour ajouter la version anglaise d'un article
 * déjà publié en français (ou l'inverse), mets `translationOf: <id>` dans le
 * frontmatter à la place de category/author/featuredImage : le script met à
 * jour ce document pour la locale demandée au lieu d'en créer un nouveau.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'

const REQUIRED = ['title', 'description', 'category', 'author', 'featuredImage']

const die = (msg) => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

/**
 * Resolves a relationship by slug/name, or by id when given a number. Lists the
 * valid options on failure — a bad category is the most likely typo, and the
 * whole point is not to have to open the admin to look it up.
 */
const resolveRef = async (payload, collection, field, value) => {
  const asId = Number(value)
  const where = Number.isInteger(asId) && String(asId) === value
    ? { id: { equals: asId } }
    : { [field]: { equals: value } }

  const { docs } = await payload.find({ collection, where, limit: 2, depth: 0 })

  if (docs.length === 0) {
    const { docs: all } = await payload.find({ collection, limit: 50, depth: 0 })
    const options = all.map((d) => `  - ${d[field]}`).join('\n')
    die(`Aucun "${value}" dans ${collection}. Valeurs possibles :\n${options || '  (collection vide)'}`)
  }
  if (docs.length > 1) die(`"${value}" est ambigu dans ${collection} — précise l'id.`)

  return docs[0].id
}

/** ~200 words/min, the usual reading-speed convention. */
const estimateReadTime = (markdown) =>
  `${Math.max(1, Math.round(markdown.split(/\s+/).filter(Boolean).length / 200))} min`

const uploadImage = async (payload, buffer, filename, alt) => {
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: buffer,
      mimetype: `image/${path.extname(filename).slice(1).replace('jpg', 'jpeg')}`,
      name: filename,
      size: buffer.length,
    },
  })
  return media.id
}

const main = async () => {
  const file = process.argv.slice(2).find((a) => !a.startsWith('--'))
  const publish = Boolean(process.env.PUBLISH)
  const dryRun = Boolean(process.env.DRY_RUN)

  if (!file) die('Usage : pnpm create-article <fichier.md>  (PUBLISH=1 / DRY_RUN=1 en préfixe)')
  const filePath = path.resolve(file)
  if (!fs.existsSync(filePath)) die(`Fichier introuvable : ${filePath}`)

  const { data: fm, content: markdown } = matter(fs.readFileSync(filePath, 'utf8'))
  const isTranslation = Boolean(fm.translationOf)

  const required = isTranslation ? ['title', 'description'] : REQUIRED
  const missing = required.filter((k) => !fm[k])
  if (missing.length) die(`Frontmatter incomplet — il manque : ${missing.join(', ')}`)
  if (!markdown.trim()) die('Le corps du markdown est vide.')

  const locale = fm.locale || 'fr'
  const payload = await getPayload({ config })

  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const content = convertMarkdownToLexical({ editorConfig, markdown })

  if (isTranslation) {
    if (dryRun) {
      console.log('\n--- dry run (traduction), rien n’a été écrit ---')
      console.log({
        translationOf: fm.translationOf,
        title: fm.title,
        slug: fm.slug ?? '(dérivé du titre)',
        locale,
        status: publish ? 'published' : 'draft',
        blocs: content.root.children.length,
      })
      process.exit(0)
    }

    const article = await payload.update({
      collection: 'articles',
      id: fm.translationOf,
      locale,
      data: {
        title: fm.title,
        ...(fm.slug ? { slug: fm.slug } : {}),
        description: fm.description,
        content,
        status: publish ? 'published' : 'draft',
      },
    })

    console.log(`\n✓ ${publish ? 'Publié' : 'Brouillon créé'} (${locale}) : ${fm.title}`)
    console.log(`  admin  https://www.onefive.app/studio-9k4x2m/collections/articles/${article.id}`)
    console.log(`  live   https://www.onefive.app/${locale}/blog/${article.slug}${publish ? '' : '  (une fois publié)'}\n`)
    process.exit(0)
  }

  const [category, author] = await Promise.all([
    resolveRef(payload, 'categories', 'slug', fm.category),
    resolveRef(payload, 'team', 'name', fm.author),
  ])
  const tags = await Promise.all((fm.tags || []).map((t) => resolveRef(payload, 'tags', 'slug', t)))

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
      blocs: content.root.children.length,
    })
    process.exit(0)
  }

  const coverPath = path.resolve(path.dirname(filePath), fm.featuredImage)
  const featuredImage = fs.existsSync(coverPath)
    ? await uploadImage(payload, fs.readFileSync(coverPath), path.basename(coverPath), fm.title)
    : await resolveRef(payload, 'media', 'filename', fm.featuredImage)

  const article = await payload.create({
    collection: 'articles',
    locale,
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
    },
  })

  console.log(`\n✓ ${publish ? 'Publié' : 'Brouillon créé'} : ${fm.title}`)
  console.log(`  admin  https://www.onefive.app/studio-9k4x2m/collections/articles/${article.id}`)
  console.log(`  live   https://www.onefive.app/${locale}/blog/${article.slug}${publish ? '' : '  (une fois publié)'}\n`)
  process.exit(0)
}

await main().catch((err) => die(err instanceof Error ? err.message : String(err)))
