import type { CollectionConfig } from 'payload'

export const RecentUpdates: CollectionConfig = {
  slug: 'recent-updates',
  admin: {
    group: 'Site',
    useAsTitle: 'title',
    description: 'Recent platform updates to display on the feedback page',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Update Title',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Launched',
          value: 'Launched',
        },
        {
          label: 'In Progress',
          value: 'In Progress',
        },
        {
          label: 'Planned',
          value: 'Planned',
        },
      ],
      label: 'Status',
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      label: 'Date Text',
      admin: {
        description: 'Ex: "Last week", "Coming soon", "Q2 2024"',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first',
      },
      label: 'Display Order',
    },
    {
      name: 'basedOnFeedback',
      type: 'checkbox',
      label: 'Based on User Feedback',
      defaultValue: false,
    },
    {
      name: 'relatedFeedback',
      type: 'relationship',
      relationTo: 'feedback',
      hasMany: true,
      admin: {
        condition: (data) => Boolean(data?.basedOnFeedback),
        description: 'Select feedback entries that inspired this update',
      },
      label: 'Related Feedback',
    },
  ],
}
