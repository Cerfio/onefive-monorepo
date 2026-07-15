// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
// import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Team } from './collections/Team'
import { Changelog } from './collections/Changelog'
import { Contact } from './collections/Contact'
import { Feedback } from './collections/Feedback'
import { RecentUpdates } from './collections/RecentUpdates'
import { BugReports } from './collections/BugReports'
import Waitlist from './collections/Waitlist'
import Newsletter from './collections/Newsletters'
import SpontaneousApplications from './collections/SpontaneousApplications'
import Resumes from './collections/Resumes'
import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { MediaArticles } from './collections/MediaArticles'
import { ArticleSuggestions } from './collections/ArticleSuggestions'
import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // The landing app already owns /api/* (blog, contact, waitlist, …), so Payload's
  // REST + GraphQL API is remapped to /payload-api to avoid a route collision.
  // Must stay in sync with the folder name: src/app/(payload)/payload-api.
  routes: {
    api: '/payload-api',
    // Non-guessable admin path: keeps the CMS login out of scanners' /admin
    // sweeps and off the landing page's public route surface.
    admin: '/studio-9k4x2m',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Onefive Studio',
      description: 'Onefive content studio',
      icons: [{ rel: 'icon', type: 'image/png', url: '/favicon.png' }],
    },
    components: {
      // Payload's default dashboard is just the collection list; this puts the
      // numbers that actually matter (and the "new article" button) above it.
      beforeDashboard: ['@/components/payload/DashboardStats#DashboardStats'],
    },
  },
  collections: [
    Users,
    Media,
    Team,
    Changelog,
    Contact,
    Feedback,
    RecentUpdates,
    BugReports,
    Waitlist,
    Newsletter,
    SpontaneousApplications,
    Resumes,
    Articles,
    Categories,
    Tags,
    MediaArticles,
    // Was never registered — /suggest-article POSTed to a collection Payload
    // did not know about, so the form had been failing silently.
    ArticleSuggestions,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true,
  }),
  sharp: sharp as any,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: true,
        'media-articles': true,
        resumes: true,
      },
      bucket: process.env.R2_BUCKET_NAME || '',
      config: {
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
  localization: {
    locales: [
      {
        code: 'en',
        label: 'English',
      },
      {
        code: 'fr',
        label: 'Français',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
})
