export const ArticleSuggestions: any = {
  slug: 'article-suggestions',
  admin: {
    group: 'Inbox',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'email', 'status', 'createdAt'],
  },
  access: {
    create: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Article Title',
      localized: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      localized: true,
      options: [
        { label: 'Startup Tips', value: 'startup-tips' },
        { label: 'Growth Stories', value: 'growth-stories' },
        { label: 'Product Updates', value: 'product-updates' },
        { label: 'Fundraising', value: 'fundraising' },
        { label: 'Tech Insights', value: 'tech-insights' },
        { label: 'Team Building', value: 'team-building' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Article Description',
      localized: true,
    },
    {
      name: 'targetAudience',
      type: 'textarea',
      label: 'Target Audience',
      localized: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Submitter Email',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Related Tags',
      defaultValue: [],
      localized: false,
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: {
            Component: ({ data = {} }: { data: any }) => {
              if (!data) return 'Tag'
              return data.value || 'Tag'
            },
          },
        },
      },
    },
    {
      name: 'wantToContribute',
      type: 'checkbox',
      label: 'Wants to Contribute',
      defaultValue: false,
    },
    {
      name: 'wantToWrite',
      type: 'checkbox',
      label: 'Wants to Write Article',
      defaultValue: false,
    },
    {
      name: 'writingExperience',
      type: 'textarea',
      label: 'Writing Experience',
      admin: {
        condition: (data: any) => data.wantToWrite,
      },
    },
    {
      name: 'sampleArticles',
      type: 'array',
      label: 'Sample Articles',
      admin: {
        condition: (data: any) => data.wantToWrite,
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          label: 'Article URL',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Under Review', value: 'reviewing' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      required: true,
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        description: 'Internal notes about this suggestion',
      },
    },
  ],
  timestamps: true,
}
