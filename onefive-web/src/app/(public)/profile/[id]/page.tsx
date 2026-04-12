import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Users, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfilePrivateSection } from './ProfilePrivateSection';
import { ProfileAuthSwitch } from './ProfileAuthSwitch';
import { BioWithExpand } from '@/components/profile/BioWithExpand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

export const revalidate = 3600;

interface ProfileSeoData {
  id: string;
  firstName: string;
  lastName: string;
  highlight: string | null;
  bio: string | null;
  city: string | null;
  countryCode: string | null;
  skills: string[] | null;
  ecosystemRoles: string[] | null;
  avatarId: string | null;
  coverId: string | null;
  latestExperience: { title: string; company: string } | null;
  startups: { id: string; name: string }[];
  stats: { followers: number; posts: number };
  createdAt: string;
  updatedAt: string;
}

async function fetchProfile(id: string): Promise<ProfileSeoData | null> {
  try {
    const res = await fetch(`${API_URL}/seo/profile/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

function getCountryName(countryCode: string): string {
  try {
    return new Intl.DisplayNames(['fr-FR'], { type: 'region' }).of(
      countryCode.toUpperCase()
    ) || countryCode;
  } catch {
    return countryCode;
  }
}

function getInitials(firstName: string, lastName: string): string {
  const f = firstName?.charAt(0) || '';
  const l = lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || '?';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchProfile(id);
  if (!profile) return { title: 'Profil' };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';

  // Title: keep under 60 chars for Google (truncates after). No "| Onefive" here — layout template adds it.
  const rawTitle = `${fullName} — ${profile.highlight || 'Profil'}`;
  const pageTitle = rawTitle.length > 58 ? fullName : rawTitle;
  const fullTitle = `${pageTitle} | Onefive`; // For openGraph/twitter sharing

  // Description: structured format, no bio (cleaner for search results)
  const location =
    profile.city && profile.countryCode
      ? `${profile.city}, ${getCountryName(profile.countryCode)}`
      : profile.city || profile.countryCode
        ? getCountryName(profile.countryCode)
        : '';
  const parts = [fullName, profile.highlight, location].filter(Boolean);
  const followers = profile.stats?.followers ?? 0;
  const description =
    parts.length > 0
      ? `${parts.join('. ')}. ${followers} abonnés. Profil sur Onefive`
      : `${fullName} sur Onefive`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'profile',
      locale: 'fr_FR',
      siteName: 'Onefive',
      url: `${baseUrl}/profile/${id}`,
      images: [
        {
          url: `${baseUrl}/api/og/profile/${id}`,
          width: 1200,
          height: 630,
          alt: fullName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${baseUrl}/api/og/profile/${id}`],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await fetchProfile(id);

  if (!profile) notFound();

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const location = [
    profile.city,
    profile.countryCode
      ? getCountryName(profile.countryCode)
      : null,
  ]
    .filter(Boolean)
    .join(', ');
  const memberSince = new Date(profile.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  const avatarUrl = profile.avatarId
    ? `${API_URL}/file/${profile.avatarId}`
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fullName,
    jobTitle: profile.highlight || undefined,
    address: location
      ? {
          '@type': 'PostalAddress',
          addressLocality: profile.city || undefined,
          addressCountry: profile.countryCode || undefined,
        }
      : undefined,
    knowsAbout: profile.skills?.length ? profile.skills : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileAuthSwitch profileId={id}>
        <div className="min-h-screen bg-[#FCFCFD]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative h-48 md:h-56 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

              <div className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative -mt-16 flex-shrink-0 sm:-mt-20">
                    {avatarUrl ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg sm:h-28 sm:w-28">
                        <Image
                          src={avatarUrl}
                          alt={fullName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 96px, 112px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-violet-400 to-purple-500 text-2xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
                        {getInitials(profile.firstName, profile.lastName)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[#101828]">
                      {fullName}
                    </h1>
                    {profile.highlight && (
                      <p className="mt-1 text-[#475467]">{profile.highlight}</p>
                    )}
                    {profile.latestExperience && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-[#475467]">
                        <Briefcase className="h-4 w-4" />
                        {profile.latestExperience.title} chez{' '}
                        {profile.latestExperience.company}
                      </p>
                    )}

                    {profile.ecosystemRoles &&
                      profile.ecosystemRoles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {profile.ecosystemRoles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="border-violet-200 bg-violet-50 text-violet-700"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#475467]">
                      {location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Membre depuis {memberSince}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>
                          {profile.stats.followers} abonnés
                          {profile.stats.posts > 0 &&
                            ` · ${profile.stats.posts} publications`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <BioWithExpand
                    bio={profile.bio}
                    className="mt-4 text-sm text-[#475467]"
                  />
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-violet-200 bg-violet-50/50 text-violet-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {profile.startups && profile.startups.length > 0 && (
                  <div className="mt-6">
                    <h2 className="mb-2 text-sm font-semibold text-[#101828]">
                      Startups
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.startups.map((startup) => (
                        <Link
                          key={startup.id}
                          href={`/startup/${startup.id}`}
                          className="rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
                        >
                          {startup.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <ProfilePrivateSection profileId={id} />
          </div>
        </div>
      </ProfileAuthSwitch>
    </>
  );
}
