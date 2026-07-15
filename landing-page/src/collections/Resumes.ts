import path from 'path'

const Resumes: any = {
  slug: 'resumes',
  admin: {
    useAsTitle: 'candidateName',
    defaultColumns: ['candidateName', 'position', 'submittedAt', 'filename'],
    description: 'Resumes/CVs from job applicants',
    group: 'Recruitment', // Groupe dans l'interface admin
  },
  access: {
    read: ({ req }: { req: any }) => Boolean(req.user?.role === 'admin'), // Seuls les admins peuvent voir tous les CV
    create: () => true, // Tout le monde peut télécharger un CV
    update: ({ req }: { req: any }) => Boolean(req.user?.role === 'admin'),
    delete: ({ req }: { req: any }) => Boolean(req.user?.role === 'admin'),
  },
  upload: {
    staticDir: path.resolve(__dirname, '../public/uploads/resumes'),
    staticURL: '/uploads/resumes',
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    filesRequiredOnCreate: true,
    imageSizes: [], // Pas besoin de redimensionnement pour les PDFs/DOCs
    sizeLimits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  },
  fields: [
    {
      name: 'candidateName',
      type: 'text',
      label: 'Candidate Name',
      required: true,
      admin: {
        description: 'Full name of the candidate',
      },
    },
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
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      admin: {
        description: 'Contact email of the candidate',
      },
    },
    {
      name: 'position',
      type: 'text',
      label: 'Position Applied For',
      admin: {
        description: 'Current role or position the candidate is applying for',
      },
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
      admin: {
        description: 'Department the candidate is applying to',
      },
    },
    {
      name: 'application',
      type: 'relationship',
      label: 'Related Application',
      relationTo: 'spontaneous-applications',
      admin: {
        description: 'Linked job application if available',
      },
    },
    {
      name: 'notes',
      type: 'richText',
      label: 'HR Notes',
      admin: {
        description: 'Internal notes about this resume (not visible to candidates)',
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
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Shortlisted', value: 'shortlisted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Hired', value: 'hired' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }: { data: any; operation: any }) => {
        if (operation === 'create') {
          return {
            ...data,
            candidateName: `${data.firstName} ${data.lastName}`,
            submittedAt: new Date().toISOString(),
          }
        }
        return data
      },
    ],
  },
}

export default Resumes
