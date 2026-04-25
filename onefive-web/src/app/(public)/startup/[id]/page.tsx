import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Calendar, Users, UserPlus } from 'lucide-react';
import { getCountryName } from '@/lib/country';
import { Card } from '@/components/base/card/card';
import { Badge } from '@/components/base/badges/badges';
import { getSectorColor } from '@/shared/constants/sector-colors';
import { StartupPrivateSection } from './StartupPrivateSection';
import { StartupAuthSwitch } from './StartupAuthSwitch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

const DESCRIPTION_TRUNCATE_LENGTH = 200;

interface StartupSeoData {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  categories?: string[];
  city?: string;
  countryCode?: string;
  foundedDate?: string;
  logo?: string;
  coverImage?: string;
  stats?: { followers?: number; members?: number };
  createdAt?: string;
  updatedAt?: string;
}

interface SeoApiResponse {
  success: boolean;
  data?: StartupSeoData;
}

async function fetchStartup(id: string): Promise<StartupSeoData | null> {
  try {
    const response = await fetch(`${API_URL}/seo/startup/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const result: SeoApiResponse = await response.json();
    if (!result.success || !result.data) return null;

    return result.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const startup = await fetchStartup(id);

  if (!startup) {
    return { title: 'Startup non trouvée' };
  }

  const pageTitle = startup.name;
  const fullTitle = `${pageTitle} | Onefive`;
  const description =
    startup.tagline ||
    startup.description?.slice(0, 160) ||
    `Découvrez ${startup.name} sur Onefive`;

  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url: `${baseUrl}/startup/${id}`,
      siteName: 'Onefive',
      images: [
            {
              url: `${baseUrl}/api/og/startup/${id}`,
              width: 1200,
              height: 630,
              alt: startup.name,
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

function buildJsonLd(startup: StartupSeoData, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: startup.name,
    description: startup.tagline || startup.description || undefined,
    url: `${baseUrl}/startup/${startup.id}`,
    logo: startup.logo || undefined,
    image: startup.coverImage || undefined,
    foundingDate: startup.foundedDate || undefined,
    address:
      startup.city || startup.countryCode
        ? {
            '@type': 'PostalAddress',
            addressLocality: startup.city,
            addressCountry: startup.countryCode,
          }
        : undefined,
  };
}

export const revalidate = 3600;

export default async function StartupPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const startup = await fetchStartup(id);

  if (!startup) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';
  const jsonLd = buildJsonLd(startup, baseUrl);

  const truncatedDescription = startup.description
    ? startup.description.length > DESCRIPTION_TRUNCATE_LENGTH
      ? `${startup.description.slice(0, DESCRIPTION_TRUNCATE_LENGTH)}...`
      : startup.description
    : '';

  const foundedYear = startup.foundedDate
    ? new Date(startup.foundedDate).getFullYear().toString()
    : '';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StartupAuthSwitch startupId={id}>
        <div className="min-h-screen bg-[#FCFCFD]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Card className="overflow-hidden bg-card rounded-xl border shadow-sm">
              <div className="relative h-48 md:h-56 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500">
                {startup.coverImage ? (
                  <img
                    src={startup.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-3xl font-bold text-white/90">
                      {startup.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative flex-shrink-0">
                    {startup.logo ? (
                      <img
                        src={startup.logo}
                        alt={startup.name}
                        className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg sm:h-28 sm:w-28">
                        <span className="text-3xl font-bold text-white">
                          {startup.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[#101828]">
                      {startup.name}
                    </h1>
                    {startup.tagline && (
                      <p className="mt-1 text-md text-[#475467]">
                        {startup.tagline}
                      </p>
                    )}
                    {startup.categories && startup.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {startup.categories.map((cat) => (
                          <Badge
                            key={cat}
                            type="pill-color"
                            color={getSectorColor(cat)}
                            size="md"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#475467]">
                      {(startup.city || startup.countryCode) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          <span>
                            {startup.city && startup.countryCode
                              ? `${startup.city}, ${getCountryName(startup.countryCode)}`
                              : [startup.city, startup.countryCode].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      {foundedYear && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>Fondée en {foundedYear}</span>
                        </div>
                      )}
                      {startup.stats?.members != null && (
                        <div className="flex items-center gap-1.5">
                          <Users size={14} />
                          <span>{startup.stats.members} membres</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {truncatedDescription && (
                  <p className="mt-4 text-sm text-[#475467]">
                    {truncatedDescription}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-8 text-sm">
                  {startup.stats?.followers != null && (
                    <div className="flex items-center gap-2">
                      <UserPlus size={16} className="text-[#475467]" />
                      <span className="font-semibold text-[#101828]">
                        {startup.stats.followers}
                      </span>
                      <span className="text-[#475467]">Abonnés</span>
                    </div>
                  )}
                  {startup.stats?.members != null && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#475467]" />
                      <span className="font-semibold text-[#101828]">
                        {startup.stats.members}
                      </span>
                      <span className="text-[#475467]">Membres</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <StartupPrivateSection startupName={startup.name} />
          </div>
        </div>
      </StartupAuthSwitch>
    </>
  );
}
