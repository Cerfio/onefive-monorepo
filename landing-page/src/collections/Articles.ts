import type { Access } from 'payload'
// The import statement is causing an error due to the module not being found.

// import { BlocksFeature } from 'payload'

// Removing the import statement to fix the issue.
import { slugFrom } from '../lib/slugify'

export const Articles: any = {
  slug: 'articles',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'category',
      'author',
      'status',
      'publishedAt',
      'views',
      'displayOnNavbar',
    ],
    // The blog is served under /:locale/blog/:slug; unsaved/slug-less docs have
    // nothing to point at, so the button is hidden rather than 404ing.
    preview: (doc: { slug?: string }, { locale }: { locale?: string }) =>
      doc?.slug ? `https://www.onefive.app/${locale || 'fr'}/blog/${doc.slug}` : null,
  },
  access: {
    // Le blog passe par la Local API, donc cette règle ne gouverne que le REST
    // public : un article publié y reste lisible, un brouillon non.
    read: ((({ req }) => (req.user ? true : { status: { equals: 'published' } })) as Access),
  },
  fields: [
    {
      name: 'displayOnNavbar',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: "Afficher l'article sur la navbar",
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: "Le titre de l'article",
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
      admin: {
        description: "L'identifiant unique utilisé dans l'URL (ex: ai-startup-guide)",
      },
      hooks: {
        beforeValidate: [slugFrom('title')],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: "Un résumé court de l'article (140-160 caractères)",
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: "L'image principale de l'article (recommandé: 1200x630)",
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: "La catégorie principale de l'article",
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'team', // Relation avec la collection Team existante
      required: true,
      admin: {
        description: "L'auteur de l'article (membre de l'équipe)",
        condition: (_: any, _siblingData: any) => {
          // Filtrer pour n'afficher que les membres de l'équipe qui peuvent être auteurs
          // Par exemple, on pourrait vouloir n'afficher que ceux marqués comme "Founder" ou "Community"
          return true // Retirer cette condition ou la personnaliser selon vos besoins
        },
      },
    },
    {
      name: 'authorTitle',
      type: 'text',
      admin: {
        description:
          "Titre spécifique de l'auteur pour cet article (optionnel, utilisé si différent du rôle habituel)",
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: "Les tags associés à l'article",
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mettre en avant cet article sur la page blog',
      },
    },
    {
      name: 'readTime',
      type: 'text',
      admin: {
        description: 'Temps de lecture estimé (ex: 5 min)',
      },
      hooks: {
        beforeChange: [
          ({ data }: { data: any }) => {
            // `data` holds the incoming payload only — Payload never merges it
            // with the stored doc before running field hooks, yet it runs the
            // hooks of every field regardless. So a partial update (the view
            // counter sends `{ views }` alone) arrives here with no `content`.
            // Returning a default then would overwrite the real read time; only
            // `undefined` leaves the stored value alone.
            if (!data?.content) return undefined

            // Supposons qu'un adulte lit environ 200-250 mots par minute
            const textContent = data.content.root.children
            let wordCount = 0
            for (const child of textContent) {
              if (child.children) {
                for (const grandChild of child.children) {
                  if (grandChild.text) {
                    wordCount += grandChild.text.split(/\s+/).length
                  }
                }
              }
            }
            const minutes = Math.ceil(wordCount / 200)
            return `${minutes} min`
          },
        ],
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: "Nombre de vues de l'article",
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      maxRows: 3,
      admin: {
        description: 'Articles connexes à suggérer (max 3)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Brouillon',
          value: 'draft',
        },
        {
          label: 'En revue',
          value: 'review',
        },
        {
          label: 'Publié',
          value: 'published',
        },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: "Date de publication de l'article",
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ data, originalDoc }: { data: any; originalDoc: any }) => {
            if (data.status === 'published' && !originalDoc?.publishedAt) {
              return new Date()
            }
            return data.publishedAt
          },
        ],
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO Metadata',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            description: 'Titre SEO personnalisé (si différent du titre principal)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Description SEO (si différente de la description principale)',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          localized: true,
          admin: {
            description: 'Mots-clés séparés par des virgules',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              "Image pour partage sur réseaux sociaux (si différente de l'image principale)",
          },
        },
      ],
    },
  ],
  endpoints: [
    {
      path: '/increment-views/:id',
      method: 'post',
      handler: async (req: any, res: any, { id }: { id: string }) => {
        try {
          const article = await req.payload.findByID({
            collection: 'articles',
            id,
          })

          await req.payload.update({
            collection: 'articles',
            id,
            data: {
              views: (article.views || 0) + 1,
            },
          })

          res.status(200).json({ success: true })
        } catch (error) {
          console.error('Error incrementing views:', error)
          res.status(500).json({ success: false })
        }
      },
    },
  ],
  hooks: {
    afterRead: [
      ({ doc }: { doc: any }) => {
        // Vous pouvez transformer les données après lecture
        // Par exemple, formater les dates, calculer des données
        return doc
      },
    ],
  },
}
