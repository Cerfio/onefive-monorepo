import type { CollectionConfig } from 'payload'

export const BugReports: CollectionConfig = {
  slug: 'bug-reports',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'priority', 'status', 'submittedAt'],
    description: 'Bug reports submitted by users or internal team',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Bug Title',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'User Interface', value: 'ui' },
        { label: 'Functionality', value: 'functionality' },
        { label: 'Performance', value: 'performance' },
        { label: 'Account Issues', value: 'account' },
        { label: 'Mobile Experience', value: 'mobile' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      name: 'stepsToReproduce',
      type: 'textarea',
      required: true,
      label: 'Steps to Reproduce',
    },
    {
      name: 'expectedBehavior',
      type: 'textarea',
      required: true,
      label: 'Expected Behavior',
    },
    {
      name: 'actualBehavior',
      type: 'textarea',
      required: true,
      label: 'Actual Behavior',
    },
    {
      name: 'additionalInformation',
      type: 'textarea',
      required: false,
      label: 'Additional Information',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Review', value: 'in-review' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
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
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
      label: 'Internal Notes',
    },
    {
      name: 'assignedTo',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Developer assigned to fix this bug',
      },
      label: 'Assigned To',
    },
    {
      name: 'relatedBugs',
      type: 'relationship',
      relationTo: 'bug-reports',
      hasMany: true,
      admin: {
        description: 'Link to related bug reports',
      },
      label: 'Related Bugs',
    },
    {
      name: 'fixedInVersion',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Version where this bug was fixed',
      },
      label: 'Fixed In Version',
    },
  ],
}
