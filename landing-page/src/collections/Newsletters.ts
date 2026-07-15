import type { Access } from 'payload'
const Newsletter: any = {
  slug: 'newsletter',
  admin: {
    group: 'Growth',
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'subscribedAt'],
    description: 'Subscribers to the newsletter',
  },
  access: {
    // Les inscriptions arrivent par /api/newsletter via la Local API.
    read: ((({ req }) => Boolean(req.user)) as Access),
    create: ((({ req }) => Boolean(req.user)) as Access),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      unique: true,
      admin: {
        description: 'The subscriber email address',
      },
      hooks: {
        beforeValidate: [({ value }: { value: string }) => value && value.toLowerCase()],
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Subscription Status',
      required: true,
      index: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Unsubscribed',
          value: 'unsubscribed',
        },
        {
          label: 'Bounced',
          value: 'bounced',
        },
      ],
      admin: {
        description: 'The current status of this subscriber',
      },
    },
    {
      name: 'source',
      type: 'select',
      label: 'Subscription Source',
      required: false,
      defaultValue: 'website_footer',
      options: [
        {
          label: 'Website Footer',
          value: 'website_footer',
        },
        {
          label: 'Newsletter Page',
          value: 'newsletter_page',
        },
        {
          label: 'Blog Popup',
          value: 'blog_popup',
        },
        {
          label: 'Manual Import',
          value: 'manual_import',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Where the subscriber signed up from',
      },
    },
    {
      name: 'subscribedAt',
      type: 'date',
      label: 'Subscribed At',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the user subscribed to the newsletter',
      },
    },
    {
      name: 'lastSentAt',
      type: 'date',
      label: 'Last Email Sent',
      admin: {
        description: 'When the last newsletter was sent to this subscriber',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'preferences',
      type: 'group',
      label: 'Email Preferences',
      admin: {
        description: 'Subscriber content preferences',
      },
      fields: [
        {
          name: 'weeklyDigest',
          type: 'checkbox',
          label: 'Weekly Digest',
          defaultValue: true,
        },
        {
          name: 'productUpdates',
          type: 'checkbox',
          label: 'Product Updates',
          defaultValue: true,
        },
        {
          name: 'events',
          type: 'checkbox',
          label: 'Events & Webinars',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        description: 'Internal notes about this subscriber (not visible to subscribers)',
      },
    },
  ],
}

export default Newsletter
