import type { CollectionConfig } from 'payload'
const Waitlist: CollectionConfig = {
  slug: 'waitlist',
  admin: {
    group: 'Growth',
    useAsTitle: 'email',
    defaultColumns: ['email', 'job', 'submittedAt', 'status'],
  },
  access: {
    // Les inscriptions arrivent par /api/waitlist, qui passe par la Local API
    // (overrideAccess: true) — ces règles ne gouvernent que le REST public.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Email address of the person joining the waitlist',
      },
    },
    {
      name: 'job',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Founder', value: 'founder' },
        { label: 'Investor', value: 'investor' },
        { label: 'Aspiring Founder', value: 'aspiring-founder' },
        { label: 'Student', value: 'student' },
        { label: 'Startup Employee', value: 'startup-employee' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'source',
      label: 'How did you hear about us?',
      type: 'select',
      required: true,
      options: [
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Product Hunt', value: 'product-hunt' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'Friend Referral', value: 'friend' },
        { label: 'Google Search', value: 'google' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'goal',
      label: 'Main goal',
      type: 'select',
      required: true,
      options: [
        { label: 'Find co-founders or collaborators', value: 'find-cofounders' },
        { label: 'Gain visibility for my startup', value: 'gain-visibility' },
        { label: 'Access funding opportunities', value: 'access-funding' },
        { label: 'Learn from resources & community', value: 'learn-resources' },
        { label: 'Discover events & opportunities', value: 'discover-events' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      index: true,
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
        description: 'Status of this waitlist entry',
      },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Invited', value: 'invited' },
        { label: 'Active', value: 'active' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Admin notes about this waitlist entry',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }: { data: any; operation: any }) => {
        if (operation === 'create') {
          return {
            ...data,
            submittedAt: new Date().toISOString(),
          }
        }
        return data
      },
    ],
  },
}

export default Waitlist
