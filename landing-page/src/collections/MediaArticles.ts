// collections/Media.js
export const MediaArticles: any = {
  slug: 'media-articles',
  admin: {
    group: 'Content',
  },
  upload: {
    staticURL: '/media-articles',
    staticDir: 'media-articles',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 480,
        position: 'centre',
      },
      {
        name: 'featured',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: "Texte alternatif pour l'accessibilité",
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: "Légende à afficher sous l'image (optionnel)",
      },
    },
  ],
}
