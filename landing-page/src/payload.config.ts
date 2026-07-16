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
import { Jobs } from './collections/Jobs'
import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Shared by both s3Storage adapters below. The credentials must be scoped to
// every bucket they cover: a token that can only reach one of them fails at
// read time with a 403, which surfaces as a 500 on /payload-api/<slug>/file/*.
const r2Config = {
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
}

// Shared per-collection options for the public image collections. `url` (on the
// base doc and every image size) is emitted as a public CDN link, and the
// Payload access-control proxy is turned off so files are never served through
// /payload-api/<slug>/file/*. Only the public buckets get this — `resumes` must
// keep its access control.
const publicMediaOptions = {
  disablePayloadAccessControl: true as const,
  generateFileURL: ({ filename }: { filename: string }) =>
    `${process.env.NEXT_PUBLIC_CDN_URL}/${filename}`,
}

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
    Jobs,
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
    // `push` auto-syncs the DB schema to this config on boot. It is a dev
    // convenience: it applies whatever the running code says, with no review,
    // so a renamed field can drop a column and take its data with it. It was
    // on in production. Schema changes now go through src/migrations, applied
    // by `payload migrate` at build time.
    push: false,
  }),
  sharp: sharp as any,
  plugins: [
    payloadCloudPlugin(),
    // Public site images. This bucket is served straight to the browser by the
    // custom domain in NEXT_PUBLIC_CDN_URL, which bypasses Payload entirely —
    // anything stored here is world-readable by URL. We point every generated
    // `url` (base file and each image size) at that CDN and disable the Payload
    // access-control proxy, so no reader ever routes an image through
    // /payload-api/media/file/* (which hits R2 with the app token and 500s when
    // that token can't reach the bucket).
    s3Storage({
      collections: {
        media: publicMediaOptions,
        'media-articles': publicMediaOptions,
      },
      bucket: process.env.R2_BUCKET_NAME || '',
      config: r2Config,
    }),
    // Applicant CVs. Kept in a bucket with no custom domain so the `resumes`
    // access control (logged-in only) is the sole way to reach them.
    s3Storage({
      collections: {
        resumes: true,
      },
      bucket: process.env.R2_RESUMES_BUCKET_NAME || '',
      config: r2Config,
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
