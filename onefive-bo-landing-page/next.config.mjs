import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Prevent Next.js from bundling server-only Payload CLI tools that have
  // optional peer deps (json-schema-to-typescript → cli-color) missing at build time
  serverExternalPackages: ['json-schema-to-typescript'],
}

export default withPayload(nextConfig)
