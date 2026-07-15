import type { CollectionConfig } from 'payload'

export const Contact: CollectionConfig = {
  slug: 'contact',
  admin: {
    group: 'Inbox',
    useAsTitle: 'email',
    description: 'Contact form submissions',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      label: 'First Name',
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: 'Last Name',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email Address',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Technical Support',
          value: 'technical',
        },
        {
          label: 'Account Help',
          value: 'account',
        },
        {
          label: 'Feature Request',
          value: 'feature',
        },
        {
          label: 'Billing Inquiry',
          value: 'billing',
        },
        {
          label: 'Partnership Opportunities',
          value: 'partnership',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      label: 'Category',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
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
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Resolved',
          value: 'resolved',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
      label: 'Status',
    },
    {
      name: 'notes',
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
  ],
}
