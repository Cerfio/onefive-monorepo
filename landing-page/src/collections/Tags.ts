import { slugFrom } from '../lib/slugify'

export const Tags: any = {
  slug: 'tags',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
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
        description: 'Nom du tag (ex: Machine Learning)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: "L'identifiant unique pour le tag",
      },
      hooks: {
        beforeValidate: [slugFrom('name')],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description optionnelle du tag',
      },
    },
  ],
}
