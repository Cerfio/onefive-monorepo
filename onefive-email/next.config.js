/** @type {import('next').NextConfig} */
const nextConfig = {
  // nodemailer (sink de dev) fait des require() dynamiques que le bundler ne sait
  // pas tracer : on le garde en dépendance Node externe.
  serverExternalPackages: ['nodemailer'],
}

module.exports = nextConfig
