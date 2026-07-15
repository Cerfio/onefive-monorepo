export const Tags: any = {
  slug: 'tags',
  admin: {
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
        description: 'Description optionnelle du tag',
      },
    },
  ],
}
