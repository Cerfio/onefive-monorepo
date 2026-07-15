import { slugFrom } from '../lib/slugify'

/**
 * Job openings. The page and its JobPosting schema are generated from these
 * fields, so an opening cannot exist without real dates — the hardcoded
 * Senior Full-Stack Engineer posting shipped with invented ones and outlived
 * the role by months because nothing made it expire.
 */
export const Jobs: any = {
  slug: 'jobs',
  labels: { singular: 'Job opening', plural: 'Job openings' },
  admin: {
    group: 'Recruitment',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'datePosted', 'validThrough'],
    description:
      'Publier une offre la met dans Google for Jobs — de vraies personnes candidateront. Ne publier que des postes réellement ouverts.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: "L'intitulé du poste (ex : Senior Full-Stack Engineer)" },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: "L'URL : /careers/<slug>. Dérivé du titre si laissé vide." },
      hooks: { beforeValidate: [slugFrom('title')] },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publiée', value: 'published' },
        { label: 'Fermée', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Seules les offres « Publiée » sont visibles et indexées.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Le descriptif envoyé à Google for Jobs.' },
    },
    {
      name: 'datePosted',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'La VRAIE date de publication — Google affiche « publiée il y a N jours ».',
      },
    },
    {
      name: 'validThrough',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        description: "Date d'expiration. Google retire l'offre tout seul après.",
      },
    },
    {
      name: 'employmentType',
      type: 'select',
      required: true,
      defaultValue: 'FULL_TIME',
      // schema.org values — used verbatim in the JobPosting.
      options: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN', 'TEMPORARY'],
    },
    {
      name: 'addressLocality',
      type: 'text',
      required: true,
      defaultValue: 'Paris',
    },
    {
      name: 'addressCountry',
      type: 'text',
      required: true,
      defaultValue: 'FR',
      admin: { description: 'Code pays ISO (FR, BE, …)' },
    },
    {
      name: 'jobLocationType',
      type: 'select',
      defaultValue: 'TELECOMMUTE',
      options: [
        { label: 'Télétravail possible (TELECOMMUTE)', value: 'TELECOMMUTE' },
        { label: 'Sur site uniquement', value: 'ONSITE' },
      ],
      admin: {
        description:
          "Sur site = l'adresse ci-dessus fait foi. TELECOMMUTE est la seule " +
          'valeur que schema.org connaît : « sur site » se dit en ne la ' +
          "publiant pas, pas en publiant « ONSITE » — d'où le choix ici.",
      },
    },
    {
      name: 'applicantLocationRequirements',
      type: 'text',
      admin: { description: 'Ex : Europe. Uniquement si télétravail.' },
    },
    {
      name: 'skills',
      type: 'text',
      admin: { description: 'Ex : React, Node.js, TypeScript' },
    },
    {
      type: 'group',
      name: 'salary',
      label: 'Rémunération',
      admin: {
        description:
          "Renseigner la fourchette réelle. Une offre sans salaire est moins bien classée par Google — et un montant inventé se paie plus cher qu'un champ vide.",
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'min', type: 'number', admin: { width: '33%' } },
            { name: 'max', type: 'number', admin: { width: '33%' } },
            {
              name: 'currency',
              type: 'select',
              defaultValue: 'EUR',
              options: ['EUR', 'USD', 'GBP'],
              admin: { width: '34%' },
            },
          ],
        },
        {
          name: 'unitText',
          type: 'select',
          defaultValue: 'YEAR',
          options: ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'],
        },
      ],
    },
  ],
}
