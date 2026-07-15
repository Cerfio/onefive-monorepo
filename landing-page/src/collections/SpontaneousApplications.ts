const SpontaneousApplications: any = {
  slug: 'spontaneous-applications',
  admin: {
    useAsTitle: 'fullName',
    description: 'Spontaneous job applications',
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      required: true,
    },
    {
      name: 'fullName',
      type: 'text',
      label: 'Full Name',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [({ data }: { data: any }) => `${data.firstName} ${data.lastName}`],
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      unique: true,
      admin: {
        description: 'Applicant email address',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
      admin: {
        description: 'Applicant phone number',
      },
    },
    {
      name: 'preferredDepartment',
      type: 'select',
      label: 'Preferred Department',
      required: true,
      options: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Product', value: 'Product' },
        { label: 'Design', value: 'Design' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Sales', value: 'Sales' },
        { label: 'Operations', value: 'Operations' },
        { label: 'HR', value: 'HR' },
        { label: 'Finance', value: 'Finance' },
      ],
    },
    {
      name: 'currentRole',
      type: 'text',
      label: 'Current Role',
      required: true,
    },
    {
      name: 'yearsOfExperience',
      type: 'number',
      label: 'Years of Experience',
      required: true,
      min: 0,
      max: 50,
    },
    {
      name: 'socialProfiles',
      type: 'group',
      label: 'Social Profiles',
      fields: [
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'github',
          type: 'text',
          label: 'GitHub URL',
        },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Motivation Message',
      required: true,
    },
    {
      name: 'resume',
      type: 'upload',
      label: 'Resume / CV',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Application Status',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Interview Scheduled', value: 'interview_scheduled' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Hired', value: 'hired' },
      ],
    },
    {
      name: 'internalNotes',
      type: 'richText',
      label: 'Internal Notes',
      admin: {
        description: 'Notes for internal team review (not visible to applicants)',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ operation, data }: { operation: any; data: any }) => {
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
  access: {
    read: () => true,
    create: () => true, // Anyone can create an application
  },
}

export default SpontaneousApplications
