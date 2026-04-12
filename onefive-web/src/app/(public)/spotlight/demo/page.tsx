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
  Code,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SpotlightNavbar } from '../[id]/SpotlightNavbar';
import { SpotlightCtaButtons } from './SpotlightCtaButtons';
import { SpotlightMobileBar } from './SpotlightMobileBar';

const SPOT = {
  id: 'f572c50d-88d6-42f5-baf1-9b57e89ca386',
  name: 'Station F',
  highlight: "World's biggest startup campus, based in Paris.",
  description:
    "There's no better place to build: from idea to scale, STATION F gives 1,000+ startups access to a high-impact ecosystem and a network of top-tier partners, entrepreneurs, and funds.",
  address: '5 Parv. Alan Turing, 75013 Paris',
  image:
    'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqflgrXR-N3puwWcLbs1miLK8cUg5iFjYz0i2GPJWFjuUFV2WKyxUXh68lpSsN9srV1jE-ukDH4gDxf94oP3kkDemeVi30RaYGNg3J9kqPfEDYFKAIZ9NJluLGNMzIFkoQ5rj8=s1360-w1360-h1020-rw',
  url: 'https://stationf.co/',
  provider: 'ONEFIVE',
  lat: 48.8333617,
  lng: 2.371778616,
  incubator: {
    expertiseDomains: ['TECH'],
    hiringPeriod: 'MONTHLY',
    fundingModel: 'NONE',
    equityPercentage: 0,
    investmentAmount: 0,
    stage: 'ALL',
    programDuration: 52,
  },
};

const SIMILAR_SPOTS = [
  {
    name: 'Y Combinator',
    type: 'Accélérateur',
    location: 'San Francisco, US',
  },
  {
    name: 'Techstars Paris',
    type: 'Accélérateur',
    location: 'Paris, FR',
  },
  {
    name: 'BPI Excellence',
    type: 'Incubateur',
    location: 'Paris, FR',
  },
];

const HIRING_PERIOD_LABELS: Record<string, string> = {
  MONTHLY: 'Mensuel',
  QUARTERLY: 'Trimestriel',
  SEMESTERLY: 'Semestriel',
  YEARLY: 'Annuel',
};

const STAGE_LABELS: Record<string, string> = {
  IDEA: 'Idée',
  PRESEED: 'Pré-Seed',
  SEED: 'Seed',
  SERIES_A: 'Série A',
  GROWTH: 'Growth',
  ALL: 'Tous stades',
};

const PROVIDER_LABELS: Record<string, string> = {
  ONEFIVE: 'Onefive',
  BPI_FRANCE: 'BPI France',
  EVENTBRITE: 'Eventbrite',
  MEETUP: 'Meetup',
};

const PERKS = [
  'Accès à un réseau de 1 000+ startups actives',
  'Mentorat par des entrepreneurs de renommée mondiale',
  'Espaces de travail partagés et privatifs',
  'Accès à des investisseurs et fonds de premier plan',
  'Programmes de formation et workshops exclusifs',
  'Communauté internationale et diversifiée',
];

export default function SpotlightDemoPage() {
  const mapsUrl = `https://maps.google.com/maps?q=${SPOT.lat},${SPOT.lng}&z=15&output=embed`;
  const mapsDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${SPOT.lat},${SPOT.lng}`;
  const isOnefiveProvider = SPOT.provider.toUpperCase() === 'ONEFIVE';
  const providerLabel = PROVIDER_LABELS[SPOT.provider.toUpperCase()] ?? SPOT.provider;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="w-full max-w-screen-xl mx-auto">
        <SpotlightNavbar />
      </div>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-3">
        <div className="relative h-[58vh] min-h-[420px] max-h-[580px] overflow-hidden rounded-2xl">
          <img
            src={SPOT.image}
            alt={SPOT.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Multi-stop gradient for legibility */}
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
              <a
                href={SPOT.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                stationf.co
              </a>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-[#5E6AD2] px-3 py-1 text-xs font-semibold text-white">
                Incubateur
              </span>
              <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1 text-xs font-medium text-white flex items-center gap-1">
                <Code className="h-3 w-3" />
                Tech
              </span>
              {isOnefiveProvider ? (
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
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              {SPOT.name}
            </h1>
            <p className="mt-2 text-lg text-white/80 max-w-2xl font-medium">
              {SPOT.highlight}
            </p>

            <div className="mt-4 flex items-center gap-1.5 text-white/60 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{SPOT.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STATS BAR ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-stretch divide-x divide-gray-100 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3 py-4 pr-8 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-[#5E6AD2]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-widest">Durée</p>
                <p className="text-sm font-bold text-[#101828]">
                  {SPOT.incubator.programDuration} semaines
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4 px-8 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-widest">Stade</p>
                <p className="text-sm font-bold text-[#101828]">
                  {STAGE_LABELS[SPOT.incubator.stage] ?? SPOT.incubator.stage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4 px-8 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Code className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-widest">Domaine</p>
                <p className="text-sm font-bold text-[#101828]">Tech</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4 px-8 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-widest">Recrutement</p>
                <p className="text-sm font-bold text-[#101828]">
                  {HIRING_PERIOD_LABELS[SPOT.incubator.hiringPeriod] ?? SPOT.incubator.hiringPeriod}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4 pl-8 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#667085] uppercase tracking-widest">Startups</p>
                <p className="text-sm font-bold text-[#101828]">1 000+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <h2 className="text-lg font-semibold text-[#101828] mb-4">À propos</h2>
              <p className="text-[#475467] leading-relaxed text-sm">
                {SPOT.description}
              </p>

              {/* Perks */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-[#101828] mb-4">Ce que vous obtenez</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERKS.map((perk, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#5E6AD2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-[#5E6AD2]" />
                      </div>
                      <span className="text-sm text-[#475467]">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Programme details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <h2 className="text-lg font-semibold text-[#101828] mb-5">Détails du programme</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">Durée</p>
                  <p className="text-xl font-bold text-[#101828]">{SPOT.incubator.programDuration}</p>
                  <p className="text-xs text-[#667085]">semaines</p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">Stade cible</p>
                  <p className="text-sm font-bold text-[#101828] mt-1">
                    {STAGE_LABELS[SPOT.incubator.stage] ?? SPOT.incubator.stage}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">Financement</p>
                  <p className="text-sm font-bold text-[#101828] mt-1">Aucun equity</p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">Recrutement</p>
                  <p className="text-sm font-bold text-[#101828] mt-1">
                    {HIRING_PERIOD_LABELS[SPOT.incubator.hiringPeriod]}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">Domaine</p>
                  <p className="text-sm font-bold text-[#101828] mt-1">Tech</p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">Lieu</p>
                  <p className="text-sm font-bold text-[#101828] mt-1">Paris 13e</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 pb-0 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#101828]">Localisation</h2>
                  <p className="text-sm text-[#667085] mt-0.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {SPOT.address}
                  </p>
                </div>
                <a
                  href={mapsDirectionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-[#344054] hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Itinéraire
                </a>
              </div>
              <div className="mt-4 h-64 relative">
                <iframe
                  src={mapsUrl}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Station F Map"
                />
              </div>
            </div>

            {/* Similar spots */}
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
                {SIMILAR_SPOTS.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 hover:border-[#5E6AD2]/30 hover:bg-[#5E6AD2]/5 px-4 py-3.5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Rocket className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#101828] group-hover:text-[#5E6AD2] transition-colors">
                          {s.name}
                        </p>
                        <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {s.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#5E6AD2] bg-[#5E6AD2]/10 rounded-md px-2 py-0.5">
                        {s.type}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#5E6AD2] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                Postuler à {SPOT.name}
              </h3>
              <p className="mt-1.5 text-sm text-[#667085] leading-relaxed">
                Rejoignez Onefive pour accéder au lien de candidature officiel et ne rater aucune session.
              </p>

              {/* Next session hint */}
              <div className="mt-4 rounded-lg bg-[#5E6AD2]/8 border border-[#5E6AD2]/20 px-4 py-3">
                <p className="text-xs font-semibold text-[#5E6AD2] uppercase tracking-wide">Prochaine session</p>
                <p className="text-sm font-bold text-[#101828] mt-0.5">Recrutement mensuel</p>
                <p className="text-xs text-[#667085] mt-0.5">Candidatures ouvertes en continu</p>
              </div>

              <SpotlightCtaButtons url={SPOT.url} />
            </div>

            {/* Quick summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#101828] mb-4">En bref</h3>
              <div className="space-y-3.5">
                {[
                  { label: 'Type', value: 'Incubateur' },
                  { label: 'Durée', value: `${SPOT.incubator.programDuration} semaines` },
                  { label: 'Stade', value: STAGE_LABELS[SPOT.incubator.stage] },
                  { label: 'Recrutement', value: HIRING_PERIOD_LABELS[SPOT.incubator.hiringPeriod] },
                  { label: 'Equity', value: 'Aucun (0%)' },
                  { label: 'Coût', value: 'Gratuit' },
                  { label: 'Ville', value: 'Paris, France' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-[#667085]">{label}</span>
                    <span className="text-sm font-semibold text-[#101828]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SpotlightMobileBar url={SPOT.url} />

      {/* Bottom padding for mobile bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
