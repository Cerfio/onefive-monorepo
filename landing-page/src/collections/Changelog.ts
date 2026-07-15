import type { CollectionConfig } from 'payload'

// Types de changements disponibles
const changeTypes = [
  { label: 'New Feature', value: 'feature' },
  { label: 'Improvement', value: 'improvement' },
  { label: 'Bug Fix', value: 'bugfix' },
  { label: 'Security', value: 'security' },
]

export const Changelog: CollectionConfig = {
  slug: 'releases',
  labels: {
    singular: 'Release',
    plural: 'Releases',
  },
  admin: {
    defaultColumns: ['version', 'date', 'summary', 'isLatest'],
    useAsTitle: 'version',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'version',
      type: 'text',
      required: true,
      label: 'Version',
      admin: {
        description: 'Format: v1.2.0',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'MMMM d, yyyy',
        },
      },
    },
    {
      name: 'summary',
      type: 'text',
      required: true,
      label: 'Release Summary',
    },
    {
      name: 'isLatest',
      type: 'checkbox',
      label: 'Is Latest Release',
      defaultValue: false,
    },
    {
      name: 'changes',
      type: 'array',
      label: 'Changes',
      required: true,
      //   admin: {
      //     components: {
      //       RowLabel: ({ data }: { data: any }) => {
      //         return React.createElement(
      //           'span',
      //           {},
      //           `${data?.type || 'Change'}: ${data?.title || ''}`,
      //         )
      //       },
      //     },
      //   },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: changeTypes,
          admin: {
            description: 'Type of change',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
  //   hooks: {
  //     beforeChange: [
  //       // Si isLatest est true, mettre à jour les autres documents pour définir isLatest à false
  //       async ({ operation, data, req, context }) => {
  //         if (operation === 'create' || operation === 'update') {
  //           if (data.isLatest) {
  //             const payload = req.payload
  //             await payload.update({
  //               collection: 'releases',
  //               where: {
  //                 and: [
  //                   {
  //                     id: {
  //                       not_equals: (context.doc as { id?: string })?.id ?? 'new-doc',
  //                     },
  //                   },
  //                   {
  //                     isLatest: {
  //                       equals: true,
  //                     },
  //                   },
  //                 ],
  //               },
  //               data: {
  //                 isLatest: false,
  //               },
  //             })
  //           }
  //         }
  //         return data
  //       },
  //     ],
  //   },
}
