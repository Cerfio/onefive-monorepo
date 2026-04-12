import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
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
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      label: 'Position / Title',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Member Photo',
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
      label: 'Biography',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Founder',
          value: 'Founder',
        },
        {
          label: 'Product',
          value: 'Product',
        },
        {
          label: 'Tech',
          value: 'Tech',
        },
        {
          label: 'Community',
          value: 'Community',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      label: 'Category',
    },
    {
      name: 'socials',
      type: 'array',
      label: 'Social Networks',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            {
              label: 'LinkedIn',
              value: 'linkedin',
            },
            {
              label: 'Twitter',
              value: 'twitter',
            },
            {
              label: 'GitHub',
              value: 'github',
            },
            {
              label: 'Medium',
              value: 'medium',
            },
            {
              label: 'Dribbble',
              value: 'dribbble',
            },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'Profile URL',
        },
      ],
    },
    {
      name: 'content',
      type: 'array',
      label: 'Key Experience Points',
      fields: [
        {
          name: 'point',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
