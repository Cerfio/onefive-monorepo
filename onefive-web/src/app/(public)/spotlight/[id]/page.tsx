import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  ExternalLink,
  Share2,
  Heart,
  Calendar,
  Layers,
  Rocket,
  Globe,
  ChevronRight,
  Check,
  DollarSign,
  Trophy,
  Zap,
  Building,
  Code,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SpotlightNavbar } from './SpotlightNavbar';
import { SpotlightCtaButtons } from './SpotlightCtaButtons';
import { SpotlightMobileBar } from './SpotlightMobileBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

const SPOT_TYPES: Record<string, string> = {
  EVENT: 'Événement',
  CONTEST: 'Concours',
  INCUBATOR: 'Incubateur',
  ACCELERATOR: 'Accélérateur',
  COWORKINGSPACE: 'Espace de coworking',
};

const FORMAT_LABELS: Record<string, string> = {
  ONLINE: 'En ligne',
  INPERSON: 'Présentiel',
  HYBRID: 'Hybride',
};

const FUNDING_LABELS: Record<string, string> = {
  GRANT: 'Subvention',
  EQUITY: 'Equity',
  REVENUE_SHARE: 'Revenue Share',
  EQUITY_AND_GRANT: 'Equity + Subvention',
  NONE: 'Aucun financement',
};

const STAGE_LABELS: Record<string, string> = {
  IDEA: 'Idée',
  PRESEED: 'Pré-Seed',
  SEED: 'Seed',
  SERIES_A: 'Série A',
  GROWTH: 'Growth',
  ALL: 'Tous stades',
};

const PRIZE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  GRANT: 'Subvention',
  SERVICES: 'Services',
  VISIBILITY: 'Visibilité',
  MIXED: 'Mixte',
};

const HIRING_PERIOD_LABELS: Record<string, string> = {
  HOURLY: 'Horaire',
  DAILY: 'Quotidien',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bi-hebdomadaire',
  MONTHLY: 'Mensuel',
  BIMONTHLY: 'Bimestriel',
  QUARTERLY: 'Trimestriel',
  SEMESTERLY: 'Semestriel',
  SEMIANNUAL: 'Semestriel',
  ANNUAL: 'Annuel',
};

const PROVIDER_LABELS: Record<string, string> = {
  ONEFIVE: 'Onefive',
  BPI_FRANCE: 'BPI France',
  EVENTBRITE: 'Eventbrite',
  MEETUP: 'Meetup',
};

const DOMAIN_LABELS: Record<string, string> = {
  TECH: 'Tech', AI: 'IA', FINTECH: 'Fintech', HEALTHTECH: 'Healthtech',
  EDTECH: 'Edtech', GREENTECH: 'Greentech', ECOMMERCE: 'E-commerce',
  SOCIALIMPACT: 'Impact Social', LEGALTECH: 'Legaltech', PROPTECH: 'Proptech',
  FOODTECH: 'Foodtech', MOBILITY: 'Mobilité', GAMING: 'Gaming', MEDIA: 'Média',
  CYBERSECURITY: 'Cybersécurité', BIOTECH: 'Biotech', WEB3: 'Web3', HR: 'RH',
  DESIGN: 'Design', MARKETING: 'Marketing', BUSINESS: 'Business', LUXURY: 'Luxe',
  BEAUTY: 'Beauté', SPORTS: 'Sport', QUANTUM: 'Quantique', ADTECH: 'Adtech',
  URBAN: 'Urbanisme', INSURTECH: 'Insurtech', OTHER: 'Autre',
};

interface Price {
  name: string;
  price: number;
  currency: string;
  fee: number;
  periodicity?: string;
}

interface SpotSeoData {
  id: string;
  name: string;
  description?: string;
  highlight?: string;
  spot: string;
  address?: string;
  image?: string;
  url?: string;
  location?: { type: string; coordinates: [number, number] } | { lat: number; lng: number } | null;
  provider?: string;
  event?: {
    beginDate: string;
    endDate: string;
    attendees?: number;
    format?: string;
    expertiseDomains?: string[];
    days?: string[];
    prices?: Price[];
  };
  contest?: {
    beginDate: string;
    endDate: string;
    expertiseDomains?: string[];
    prizeType?: string;
    prizeAmount?: number;
    eligibility?: string;
    prices?: Price[];
  };
  incubator?: {
    expertiseDomains?: string[];
    hiringPeriod?: string;
    dates?: string[];
    fundingModel?: string;
    equityPercentage?: number;
    investmentAmount?: number;
    stage?: string;
    capacity?: number;
    programDuration?: number;
    prices?: Price[];
  };
  accelerator?: {
    expertiseDomains?: string[];
    hiringPeriod?: string;
    date?: string;
    fundingModel?: string;
    equityPercentage?: number;
    investmentAmount?: number;
    stage?: string;
    capacity?: number;
    programDuration?: number;
    prices?: Price[];
  };
  coworkingSpace?: {
    openingHours?: { begin: string; end: string };
    prices?: Price[];
  };
}

interface SimilarSpot {
  id: string;
  name: string;
  spot: string;
  highlight?: string;
  address?: string;
  image?: string;
  provider?: string;
}

function extractLatLng(location: SpotSeoData['location']): { lat: number; lng: number } | null {
  if (!location) return null;
  if ('lat' in location && 'lng' in location) return { lat: location.lat, lng: location.lng };
  if ('coordinates' in location && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    return { lat: location.coordinates[1], lng: location.coordinates[0] };
  }
  return null;
}

async function fetchSpot(id: string): Promise<SpotSeoData | null> {
  try {
    const response = await fetch(`${API_URL}/seo/spot/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (!result.success || !result.data) return null;
    return result.data;
  } catch {
    return null;
  }
}

async function fetchSimilarSpots(id: string): Promise<SimilarSpot[]> {
  try {
    const response = await fetch(`${API_URL}/seo/spot/${id}/similar`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const result = await response.json();
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const spot = await fetchSpot(id);
  if (!spot) return { title: 'Spot non trouvé' };

  const spotTypeLabel = SPOT_TYPES[spot.spot] || spot.spot;
  const pageTitle = `${spot.name} — ${spotTypeLabel}`;
  const fullTitle = `${pageTitle} | Onefive`;
  const description =
    spot.highlight || spot.description?.slice(0, 160) || `Découvrez ${spot.name} sur Onefive`;

  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url: `${baseUrl}/spotlight/${id}`,
      siteName: 'Onefive',
      images: spot.image ? [{ url: spot.image, width: 1200, height: 630, alt: spot.name }] : undefined,
    },
    twitter: {
      card: spot.image ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
    },
  };
}

function buildJsonLd(spot: SpotSeoData) {
  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';
  const beginDate = spot.event?.beginDate ?? spot.contest?.beginDate ?? spot.accelerator?.date;
  const endDate = spot.event?.endDate ?? spot.contest?.endDate;
  const spotUrl = `${baseUrl}/spotlight/${spot.id}`;

  if (spot.spot === 'EVENT' || spot.spot === 'CONTEST') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: spot.name,
      description: spot.description || spot.highlight,
      image: spot.image,
      startDate: beginDate,
      endDate,
      location: spot.address ? { '@type': 'Place', address: spot.address } : undefined,
      url: spotUrl,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: spot.name,
    description: spot.description || spot.highlight,
    image: spot.image,
    address: spot.address ? { '@type': 'PostalAddress', streetAddress: spot.address } : undefined,
    url: spotUrl,
  };
}

export const revalidate = 3600;

function formatDateFr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PriceTable({ prices }: { prices: Price[] }) {
  if (!prices.length) return null;
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#101828] mb-3">Tarifs</h3>
      <div className="space-y-2">
        {prices.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
            <span className="text-sm text-[#344054] font-medium">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#101828]">
                {p.price === 0 ? 'Gratuit' : `${p.price} ${p.currency}`}
              </span>
              {p.periodicity && (
                <span className="text-xs text-[#667085]">/ {p.periodicity.toLowerCase()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  className = '',
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 py-4 min-w-fit ${className}`}>
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-[#101828]">{value}</p>
      </div>
    </div>
  );
}

function DetailCard({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
      <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">{label}</p>
      {big ? (
        <>
          <p className="text-xl font-bold text-[#101828]">{value.split(' ')[0]}</p>
          <p className="text-xs text-[#667085]">{value.split(' ').slice(1).join(' ')}</p>
        </>
      ) : (
        <p className="text-sm font-bold text-[#101828] mt-1">{value}</p>
      )}
    </div>
  );
}

export default async function SpotlightPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [spot, similarSpots] = await Promise.all([fetchSpot(id), fetchSimilarSpots(id)]);
  if (!spot) notFound();

  const jsonLd = buildJsonLd(spot);
  const spotTypeLabel = SPOT_TYPES[spot.spot] || spot.spot;
  const details = spot.event ?? spot.contest ?? spot.incubator ?? spot.accelerator ?? spot.coworkingSpace;
  const prices: Price[] = (details as any)?.prices ?? [];
  const expertiseDomains: string[] = (details as any)?.expertiseDomains ?? [];
  const incOrAcc = spot.incubator ?? spot.accelerator;
  const coords = extractLatLng(spot.location);
  const isOnefiveProvider = spot.provider?.toUpperCase() === 'ONEFIVE';
  const providerLabel = PROVIDER_LABELS[spot.provider?.toUpperCase() ?? ''] ?? spot.provider ?? '';

  const urlHost = spot.url ? (() => { try { return new URL(spot.url).hostname.replace('www.', ''); } catch { return spot.url; } })() : null;

  const mapsEmbedUrl = coords ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed` : null;
  const mapsDirectionUrl = coords ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}` : null;

  const statsBar: { icon: React.ElementType; iconBg: string; iconColor: string; label: string; value: string }[] = [];

  if (incOrAcc?.programDuration) {
    statsBar.push({ icon: Clock, iconBg: 'bg-[#5E6AD2]/10', iconColor: 'text-[#5E6AD2]', label: 'Durée', value: `${incOrAcc.programDuration} semaines` });
  }
  if (incOrAcc?.stage) {
    statsBar.push({ icon: Layers, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'Stade', value: STAGE_LABELS[incOrAcc.stage] ?? incOrAcc.stage });
  }
  if (expertiseDomains.length > 0) {
    statsBar.push({ icon: Code, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', label: 'Domaine', value: expertiseDomains.map(d => DOMAIN_LABELS[d] ?? d).join(', ') });
  }
  if (incOrAcc?.hiringPeriod) {
    statsBar.push({ icon: Calendar, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', label: 'Recrutement', value: HIRING_PERIOD_LABELS[incOrAcc.hiringPeriod] ?? incOrAcc.hiringPeriod });
  }
  if (incOrAcc?.capacity) {
    statsBar.push({ icon: Users, iconBg: 'bg-rose-50', iconColor: 'text-rose-600', label: 'Capacité', value: `${incOrAcc.capacity} startups` });
  }
  if (spot.event) {
    statsBar.push({ icon: Calendar, iconBg: 'bg-[#5E6AD2]/10', iconColor: 'text-[#5E6AD2]', label: 'Dates', value: `${formatDateFr(spot.event.beginDate)} — ${formatDateFr(spot.event.endDate)}` });
    if (spot.event.format) statsBar.push({ icon: Zap, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'Format', value: FORMAT_LABELS[spot.event.format] ?? spot.event.format });
    if (spot.event.attendees) statsBar.push({ icon: Users, iconBg: 'bg-rose-50', iconColor: 'text-rose-600', label: 'Participants', value: `${spot.event.attendees}` });
  }
  if (spot.contest) {
    statsBar.push({ icon: Calendar, iconBg: 'bg-[#5E6AD2]/10', iconColor: 'text-[#5E6AD2]', label: 'Dates', value: `${formatDateFr(spot.contest.beginDate)} — ${formatDateFr(spot.contest.endDate)}` });
    if (spot.contest.prizeType) statsBar.push({ icon: Trophy, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', label: 'Prix', value: PRIZE_LABELS[spot.contest.prizeType] ?? spot.contest.prizeType });
    if (spot.contest.prizeAmount) statsBar.push({ icon: DollarSign, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'Montant', value: `${spot.contest.prizeAmount.toLocaleString()} €` });
  }
  if (spot.coworkingSpace?.openingHours) {
    statsBar.push({ icon: Clock, iconBg: 'bg-[#5E6AD2]/10', iconColor: 'text-[#5E6AD2]', label: 'Horaires', value: `${spot.coworkingSpace.openingHours.begin} — ${spot.coworkingSpace.openingHours.end}` });
  }

  const detailCards: { label: string; value: string; big?: boolean }[] = [];
  if (incOrAcc?.programDuration) detailCards.push({ label: 'Durée', value: `${incOrAcc.programDuration} semaines`, big: true });
  if (incOrAcc?.stage) detailCards.push({ label: 'Stade cible', value: STAGE_LABELS[incOrAcc.stage] ?? incOrAcc.stage });
  if (incOrAcc?.fundingModel) detailCards.push({ label: 'Financement', value: incOrAcc.equityPercentage ? `${FUNDING_LABELS[incOrAcc.fundingModel] ?? incOrAcc.fundingModel} (${incOrAcc.equityPercentage}%)` : FUNDING_LABELS[incOrAcc.fundingModel] ?? incOrAcc.fundingModel });
  if (incOrAcc?.hiringPeriod) detailCards.push({ label: 'Recrutement', value: HIRING_PERIOD_LABELS[incOrAcc.hiringPeriod] ?? incOrAcc.hiringPeriod });
  if (expertiseDomains.length > 0) detailCards.push({ label: 'Domaine', value: expertiseDomains.map(d => DOMAIN_LABELS[d] ?? d).join(', ') });
  if (spot.address) detailCards.push({ label: 'Lieu', value: spot.address });
  if (spot.event) {
    detailCards.push({ label: 'Début', value: formatDateFr(spot.event.beginDate) });
    detailCards.push({ label: 'Fin', value: formatDateFr(spot.event.endDate) });
    if (spot.event.format) detailCards.push({ label: 'Format', value: FORMAT_LABELS[spot.event.format] ?? spot.event.format });
    if (spot.event.attendees) detailCards.push({ label: 'Participants', value: `${spot.event.attendees}` });
  }
  if (spot.contest) {
    detailCards.push({ label: 'Début', value: formatDateFr(spot.contest.beginDate) });
    detailCards.push({ label: 'Fin', value: formatDateFr(spot.contest.endDate) });
    if (spot.contest.prizeType) detailCards.push({ label: 'Type de prix', value: PRIZE_LABELS[spot.contest.prizeType] ?? spot.contest.prizeType });
    if (spot.contest.prizeAmount) detailCards.push({ label: 'Montant', value: `${spot.contest.prizeAmount.toLocaleString()} €` });
    if (spot.contest.eligibility) detailCards.push({ label: 'Éligibilité', value: spot.contest.eligibility });
  }
  if (spot.coworkingSpace?.openingHours) {
    detailCards.push({ label: 'Ouverture', value: spot.coworkingSpace.openingHours.begin });
    detailCards.push({ label: 'Fermeture', value: spot.coworkingSpace.openingHours.end });
  }

  const summaryItems: { label: string; value: string }[] = [
    { label: 'Type', value: spotTypeLabel },
  ];
  if (incOrAcc?.programDuration) summaryItems.push({ label: 'Durée', value: `${incOrAcc.programDuration} semaines` });
  if (incOrAcc?.stage) summaryItems.push({ label: 'Stade', value: STAGE_LABELS[incOrAcc.stage] ?? incOrAcc.stage });
  if (incOrAcc?.hiringPeriod) summaryItems.push({ label: 'Recrutement', value: HIRING_PERIOD_LABELS[incOrAcc.hiringPeriod] ?? incOrAcc.hiringPeriod });
  if (incOrAcc?.equityPercentage != null) summaryItems.push({ label: 'Equity', value: incOrAcc.equityPercentage === 0 ? 'Aucun (0%)' : `${incOrAcc.equityPercentage}%` });
  if (incOrAcc?.investmentAmount != null && incOrAcc.investmentAmount > 0) summaryItems.push({ label: 'Investissement', value: `${incOrAcc.investmentAmount.toLocaleString()} €` });
  if (prices.length > 0) summaryItems.push({ label: 'Prix', value: prices[0].price === 0 ? 'Gratuit' : `À partir de ${prices[0].price} ${prices[0].currency}` });
  if (spot.address) summaryItems.push({ label: 'Ville', value: spot.address });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-screen-xl mx-auto">
        <SpotlightNavbar />
      </div>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-3">
        <div className="relative h-[58vh] min-h-[420px] max-h-[580px] overflow-hidden rounded-2xl">
          {spot.image ? (
            <img
              src={spot.image}
              alt={spot.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/90">{spot.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          {/* Top actions */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5">
            <Link
              href="/spotlight"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Spotlight
            </Link>

            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <Heart className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              {spot.url && urlHost && (
                <a
                  href={spot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {urlHost}
                </a>
              )}
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-[#5E6AD2] px-3 py-1 text-xs font-semibold text-white">
                {spotTypeLabel}
              </span>
              {expertiseDomains.slice(0, 3).map((d) => (
                <span key={d} className="rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1 text-xs font-medium text-white">
                  {DOMAIN_LABELS[d] ?? d}
                </span>
              ))}
              {spot.provider && (
                isOnefiveProvider ? (
                  <span className="flex items-center gap-1 text-white/70 text-sm">
                    <Image
                      src="/onefive-logo-square.png"
                      alt="Onefive"
                      width={16}
                      height={16}
                      className="rounded opacity-80"
                    />
                    Ajouté par Onefive
                  </span>
                ) : (
                  <span className="text-white/70 text-sm">
                    Source : {providerLabel}
                  </span>
                )
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              {spot.name}
            </h1>
            {spot.highlight && (
              <p className="mt-2 text-lg text-white/80 max-w-2xl font-medium">
                {spot.highlight}
              </p>
            )}

            {spot.address && (
              <div className="mt-4 flex items-center gap-1.5 text-white/60 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{spot.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── STATS BAR ────────────────────────────────────────────────── */}
      {statsBar.length > 0 && (
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="flex items-stretch divide-x divide-gray-100 overflow-x-auto scrollbar-hide">
              {statsBar.map((stat, i) => (
                <StatItem
                  key={i}
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  iconColor={stat.iconColor}
                  label={stat.label}
                  value={stat.value}
                  className={i === 0 ? 'pr-8' : i === statsBar.length - 1 ? 'pl-8' : 'px-8'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            {spot.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <h2 className="text-lg font-semibold text-[#101828] mb-4">À propos</h2>
                <p className="text-[#475467] leading-relaxed text-sm whitespace-pre-wrap">
                  {spot.description}
                </p>
              </div>
            )}

            {/* Programme / details grid */}
            {detailCards.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <h2 className="text-lg font-semibold text-[#101828] mb-5">Détails</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {detailCards.map((card, i) => (
                    <DetailCard key={i} label={card.label} value={card.value} big={card.big} />
                  ))}
                </div>
                <PriceTable prices={prices} />
              </div>
            )}

            {/* Map */}
            {coords && mapsEmbedUrl && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 pb-0 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#101828]">Localisation</h2>
                    {spot.address && (
                      <p className="text-sm text-[#667085] mt-0.5 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {spot.address}
                      </p>
                    )}
                  </div>
                  {mapsDirectionUrl && (
                    <a
                      href={mapsDirectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-[#344054] hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Itinéraire
                    </a>
                  )}
                </div>
                <div className="mt-4 h-64 relative">
                  <iframe
                    src={mapsEmbedUrl}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${spot.name} Map`}
                  />
                </div>
              </div>
            )}

            {/* Similar spots */}
            {similarSpots.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-[#101828]">Spots similaires</h2>
                  <Link
                    href="/spotlight"
                    className="text-sm font-medium text-[#5E6AD2] hover:text-[#4F5ABF] flex items-center gap-1"
                  >
                    Voir tout
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {similarSpots.map((s) => (
                    <Link
                      key={s.id}
                      href={`/spotlight/${s.id}`}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 hover:border-[#5E6AD2]/30 hover:bg-[#5E6AD2]/5 px-4 py-3.5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <Rocket className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#101828] group-hover:text-[#5E6AD2] transition-colors">
                            {s.name}
                          </p>
                          {s.address && (
                            <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {s.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#5E6AD2] bg-[#5E6AD2]/10 rounded-md px-2 py-0.5">
                          {SPOT_TYPES[s.spot] ?? s.spot}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#5E6AD2] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* CTA card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {/* Trust signal */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                {isOnefiveProvider ? (
                  <>
                    <Image
                      src="/onefive-logo-square.png"
                      alt="Onefive"
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span className="text-xs text-[#667085]">
                      Vérifié par <span className="font-semibold text-[#101828]">Onefive</span>
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[#667085]">
                    Source : <span className="font-semibold text-[#101828]">{providerLabel}</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#101828]">
                Postuler à {spot.name}
              </h3>
              <p className="mt-1.5 text-sm text-[#667085] leading-relaxed">
                Rejoignez Onefive pour accéder au lien de candidature officiel et ne rater aucune opportunité.
              </p>

              {/* Session hint for incubator/accelerator */}
              {incOrAcc?.hiringPeriod && (
                <div className="mt-4 rounded-lg bg-[#5E6AD2]/8 border border-[#5E6AD2]/20 px-4 py-3">
                  <p className="text-xs font-semibold text-[#5E6AD2] uppercase tracking-wide">Prochaine session</p>
                  <p className="text-sm font-bold text-[#101828] mt-0.5">
                    Recrutement {(HIRING_PERIOD_LABELS[incOrAcc.hiringPeriod] ?? incOrAcc.hiringPeriod).toLowerCase()}
                  </p>
                  <p className="text-xs text-[#667085] mt-0.5">Candidatures ouvertes en continu</p>
                </div>
              )}

              <SpotlightCtaButtons url={spot.url} />
            </div>

            {/* Quick summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#101828] mb-4">En bref</h3>
              <div className="space-y-3.5">
                {summaryItems.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-[#667085]">{label}</span>
                    <span className="text-sm font-semibold text-[#101828] text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SpotlightMobileBar url={spot.url} />
      <div className="lg:hidden h-20" />
    </div>
  );
}
