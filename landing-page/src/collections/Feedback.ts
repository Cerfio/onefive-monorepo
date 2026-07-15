import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: {
    group: 'Inbox',
    useAsTitle: 'category',
    description: 'User feedback submissions',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Feature Request',
          value: 'feature',
        },
        {
          label: 'Bug Report',
          value: 'bug',
        },
        {
          label: 'User Experience',
          value: 'ux',
        },
        {
          label: 'Content Suggestion',
          value: 'content',
        },
        {
          label: 'Other Feedback',
          value: 'other',
        },
      ],
      label: 'Feedback Category',
    },
    {
      name: 'feedbackText',
      type: 'textarea',
      required: true,
      label: 'Feedback',
    },
    {
      name: 'userEmail',
      type: 'email',
      label: 'User Email',
      admin: {
        description: 'Email of the user who submitted feedback (if provided)',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'New',
          value: 'new',
        },
        {
          label: 'Under Review',
          value: 'under-review',
        },
        {
          label: 'Planned',
          value: 'planned',
        },
        {
          label: 'Implemented',
          value: 'implemented',
        },
        {
          label: 'Will Not Implement',
          value: 'rejected',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
      label: 'Status',
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'Low',
          value: 'low',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'High',
          value: 'high',
        },
        {
          label: 'Critical',
          value: 'critical',
        },
      ],
      label: 'Priority',
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
      label: 'Internal Notes',
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ operation, value }) => {
            if (operation === 'create') {
              return new Date()
            }
            return value
          },
        ],
      },
      label: 'Submitted At',
    },
    {
      name: 'addedToRoadmap',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Has this feedback been added to the product roadmap?',
      },
      label: 'Added to Roadmap',
    },
    {
      name: 'relatedFeedback',
      type: 'relationship',
      relationTo: 'feedback',
      hasMany: true,
      admin: {
        description: 'Link to related feedback submissions',
      },
      label: 'Related Feedback',
    },
  ],
}
