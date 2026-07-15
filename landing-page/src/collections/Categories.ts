export const Categories: any = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'color'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Nom de la catégorie (ex: AI & Tech)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: "L'identifiant unique pour la catégorie",
      },
      hooks: {
        beforeValidate: [
          ({ data }: { data: any }) => {
            return data?.name
              ? data.name
                  .toLowerCase()
                  .replace(/ /g, '-')
                  .replace(/[^\w-]+/g, '')
              : ''
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description courte de la catégorie',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Code couleur HEX (ex: #5E6AD2)',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: "Nom de l'icône Lucide à utiliser (ex: Rocket, Star, etc.)",
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media-articles',
      admin: {
        description: "Image d'en-tête pour la page de catégorie",
      },
    },
  ],
}
