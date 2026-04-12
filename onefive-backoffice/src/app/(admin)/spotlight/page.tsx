'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { SearchLg, XClose, Plus, Map01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { NativeSelect } from '@/components/base/select/select-native';
import { Badge } from '@/components/base/badges/badges';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';

/** Location can be GeoJSON { type: 'Point', coordinates: [lng, lat] } or { lat, lng } */
type LocationData =
  | { lat: number; lng: number }
  | { type: string; coordinates: [number, number] }
  | null;

type SpotlightRow = {
  id: string;
  name: string;
  spot: string;
  provider: string;
  highlight: string | null;
  address: string | null;
  description: string | null;
  location: LocationData;
  url: string;
  image: string | null;
  createdAt: string;
  event?: {
    beginDate: string;
    endDate: string;
    expertiseDomains?: string[];
    format?: string;
    attendees?: number;
  };
  contest?: {
    beginDate: string;
    endDate: string;
    expertiseDomains?: string[];
    prizeType?: string;
    prizeAmount?: number;
    eligibility?: string;
  };
  incubator?: {
    expertiseDomains: string[];
    hiringPeriod?: string;
    fundingModel?: string;
    equityPercentage?: number;
    investmentAmount?: number;
    stage?: string;
    capacity?: number;
    programDuration?: number;
  };
  accelerator?: {
    expertiseDomains: string[];
    hiringPeriod?: string;
    fundingModel?: string;
    equityPercentage?: number;
    investmentAmount?: number;
    stage?: string;
    capacity?: number;
    programDuration?: number;
  };
  coworkingSpace?: { openingHours?: { begin: string; end: string } };
};

type SpotType = 'EVENT' | 'CONTEST' | 'INCUBATOR' | 'ACCELERATOR' | 'COWORKINGSPACE';

type SpotFormData = {
  name: string;
  spot: SpotType;
  provider: string;
  url: string;
  highlight: string;
  address: string;
  description: string;
  image: string;
  lat: string;
  lng: string;
  beginDate: string;
  endDate: string;
  expertiseDomains: string[];
  days: string[];
  uniqueId: string;
  hiringPeriod: string;
  openingHoursBegin: string;
  openingHoursEnd: string;
  fundingModel: string;
  equityPercentage: string;
  investmentAmount: string;
  stage: string;
  capacity: string;
  programDuration: string;
  format: string;
  attendees: string;
  prizeType: string;
  prizeAmount: string;
  eligibility: string;
};

const SPOT_OPTIONS = [
  { value: 'EVENT', label: 'Événement' },
  { value: 'CONTEST', label: 'Concours' },
  { value: 'INCUBATOR', label: 'Incubateur' },
  { value: 'ACCELERATOR', label: 'Accélérateur' },
  { value: 'COWORKINGSPACE', label: 'Espace de coworking' },
];

const PROVIDER_OPTIONS = [
  { value: 'ONEFIVE', label: 'Onefive' },
  { value: 'EVENTBRITE', label: 'Eventbrite' },
  { value: 'MEETUP', label: 'Meetup' },
  { value: 'BPI_FRANCE', label: 'BPI France' },
];

const EXPERTISE_OPTIONS = [
  { value: 'TECH', label: 'Tech' },
  { value: 'AI', label: 'Intelligence Artificielle' },
  { value: 'FINTECH', label: 'Fintech' },
  { value: 'INSURTECH', label: 'Insurtech' },
  { value: 'HEALTHTECH', label: 'Healthtech' },
  { value: 'EDTECH', label: 'Edtech' },
  { value: 'GREENTECH', label: 'Greentech & Climat & Énergie' },
  { value: 'ECOMMERCE', label: 'E-commerce & Retail' },
  { value: 'SOCIALIMPACT', label: 'Impact Social' },
  { value: 'LEGALTECH', label: 'Legaltech & RegTech' },
  { value: 'PROPTECH', label: 'Immobilier & Proptech' },
  { value: 'FOODTECH', label: 'Foodtech & AgriTech' },
  { value: 'MOBILITY', label: 'Mobilité & Transport' },
  { value: 'GAMING', label: 'Gaming & Esport' },
  { value: 'MEDIA', label: 'Média & Créativité' },
  { value: 'CYBERSECURITY', label: 'Cybersécurité' },
  { value: 'BIOTECH', label: 'Biotech & Sciences' },
  { value: 'WEB3', label: 'Web3 & Blockchain' },
  { value: 'HR', label: 'RH & Future of Work' },
  { value: 'DESIGN', label: 'Design & Créativité' },
  { value: 'MARKETING', label: 'Marketing & Growth' },
  { value: 'BUSINESS', label: 'Business & Strategy' },
  { value: 'LUXURY', label: 'Luxe' },
  { value: 'BEAUTY', label: 'Beauté & Cosmétique' },
  { value: 'SPORTS', label: 'Sport' },
  { value: 'QUANTUM', label: 'Quantique' },
  { value: 'ADTECH', label: 'Adtech & Publicité' },
  { value: 'URBAN', label: 'Ville & Urbanisme' },
  { value: 'OTHER', label: 'Autre' },
];

const DAY_OPTIONS = [
  { value: 'MONDAY', label: 'Lundi' },
  { value: 'TUESDAY', label: 'Mardi' },
  { value: 'WEDNESDAY', label: 'Mercredi' },
  { value: 'THURSDAY', label: 'Jeudi' },
  { value: 'FRIDAY', label: 'Vendredi' },
  { value: 'SATURDAY', label: 'Samedi' },
  { value: 'SUNDAY', label: 'Dimanche' },
];

const PERIODICITY_OPTIONS = [
  { value: '', label: 'Non défini' },
  { value: 'HOURLY', label: 'Horaire' },
  { value: 'DAILY', label: 'Quotidien' },
  { value: 'WEEKLY', label: 'Hebdomadaire' },
  { value: 'BIWEEKLY', label: 'Bi-hebdomadaire' },
  { value: 'MONTHLY', label: 'Mensuel' },
  { value: 'BIMONTHLY', label: 'Bimestriel' },
  { value: 'QUARTERLY', label: 'Trimestriel' },
  { value: 'SEMESTERLY', label: 'Semestriel' },
  { value: 'ANNUAL', label: 'Annuel' },
];

const FUNDING_MODEL_OPTIONS = [
  { value: '', label: 'Non défini' },
  { value: 'GRANT', label: 'Subvention' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE_SHARE', label: 'Revenue Share' },
  { value: 'EQUITY_AND_GRANT', label: 'Equity + Subvention' },
  { value: 'NONE', label: 'Aucun' },
];

const STARTUP_STAGE_OPTIONS = [
  { value: '', label: 'Non défini' },
  { value: 'IDEA', label: 'Idée' },
  { value: 'PRESEED', label: 'Pré-Seed' },
  { value: 'SEED', label: 'Seed' },
  { value: 'SERIES_A', label: 'Série A' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'ALL', label: 'Tous les stades' },
];

const EVENT_FORMAT_OPTIONS = [
  { value: '', label: 'Non défini' },
  { value: 'ONLINE', label: 'En ligne' },
  { value: 'INPERSON', label: 'En présentiel' },
  { value: 'HYBRID', label: 'Hybride' },
];

const PRIZE_TYPE_OPTIONS = [
  { value: '', label: 'Non défini' },
  { value: 'CASH', label: 'Cash' },
  { value: 'GRANT', label: 'Subvention' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'VISIBILITY', label: 'Visibilité' },
  { value: 'MIXED', label: 'Mixte' },
];

const SPOT_LABELS: Record<string, string> = {
  EVENT: 'Événement',
  CONTEST: 'Concours',
  INCUBATOR: 'Incubateur',
  ACCELERATOR: 'Accélérateur',
  COWORKINGSPACE: 'Coworking',
};

/** Extract lat/lng from API location (GeoJSON or { lat, lng }) */
function getLatLngFromLocation(loc: LocationData): { lat: string; lng: string } {
  if (!loc) return { lat: '', lng: '' };
  if ('lat' in loc && 'lng' in loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    return { lat: String(loc.lat), lng: String(loc.lng) };
  }
  if ('coordinates' in loc && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    const [lng, lat] = loc.coordinates;
    return { lat: String(lat), lng: String(lng) };
  }
  return { lat: '', lng: '' };
}

const emptyForm: SpotFormData = {
  name: '',
  spot: 'EVENT',
  provider: 'ONEFIVE',
  url: '',
  highlight: '',
  address: '',
  description: '',
  image: '',
  lat: '',
  lng: '',
  beginDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  expertiseDomains: [],
  days: [],
  uniqueId: '',
  hiringPeriod: '',
  openingHoursBegin: '',
  openingHoursEnd: '',
  fundingModel: '',
  equityPercentage: '',
  investmentAmount: '',
  stage: '',
  capacity: '',
  programDuration: '',
  format: '',
  attendees: '',
  prizeType: '',
  prizeAmount: '',
  eligibility: '',
};

const PAGE_SIZE = 20;

function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const allSelected = options.length > 0 && options.every((opt) => value.includes(opt.value));

  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((opt) => opt.value));
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm font-medium text-secondary">{label}</p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-brand-primary hover:underline"
        >
          {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? 'border-brand-solid bg-brand-primary_alt text-white'
                  : 'border-secondary bg-primary text-tertiary hover:bg-secondary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function needsDates(spot: SpotType) {
  return spot === 'EVENT' || spot === 'CONTEST';
}

function needsExpertise(spot: SpotType) {
  return spot === 'EVENT' || spot === 'INCUBATOR' || spot === 'ACCELERATOR' || spot === 'CONTEST';
}

function needsFunding(spot: SpotType) {
  return spot === 'INCUBATOR' || spot === 'ACCELERATOR';
}

function needsEventDetails(spot: SpotType) {
  return spot === 'EVENT';
}

function needsContestDetails(spot: SpotType) {
  return spot === 'CONTEST';
}

function needsDays(spot: SpotType) {
  return spot === 'EVENT';
}

function needsHiringPeriod(spot: SpotType) {
  return spot === 'INCUBATOR' || spot === 'ACCELERATOR';
}

function needsOpeningHours(spot: SpotType) {
  return spot === 'COWORKINGSPACE';
}

export default function SpotlightPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<SpotlightRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SpotFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [importingImage, setImportingImage] = useState(false);

  /** Returns true if the URL should be imported (external image host) */
  const isExternalImageUrl = (url: string): boolean => {
    if (!url?.startsWith('http')) return false;
    try {
      const host = new URL(url).hostname.toLowerCase();
      const storageOrigin = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.toLowerCase();
      if (storageOrigin && url.startsWith(storageOrigin)) return false;
      return !(
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.endsWith('.r2.dev') ||
        host.includes('r2.cloudflarestorage.com')
      );
    } catch {
      return false;
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get('admin/spotlight', {
          searchParams: { skip: String(page * PAGE_SIZE), take: String(PAGE_SIZE) },
        })
        .json<{ data: SpotlightRow[]; total: number }>();
      setItems(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: SpotlightRow) => {
    setEditingId(item.id);
    const incOrAcc = item.incubator ?? item.accelerator;
    const { lat, lng } = getLatLngFromLocation(item.location);
    setForm({
      name: item.name,
      spot: item.spot as SpotType,
      provider: item.provider,
      url: item.url ?? '',
      highlight: item.highlight ?? '',
      address: item.address ?? '',
      description: item.description ?? '',
      image: item.image ?? '',
      lat,
      lng,
      beginDate:
        item.event?.beginDate?.slice(0, 16) ??
        item.contest?.beginDate?.slice(0, 16) ??
        new Date().toISOString().slice(0, 16),
      endDate:
        item.event?.endDate?.slice(0, 16) ??
        item.contest?.endDate?.slice(0, 16) ??
        new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      expertiseDomains:
        item.event?.expertiseDomains ??
        item.contest?.expertiseDomains ??
        item.incubator?.expertiseDomains ??
        item.accelerator?.expertiseDomains ??
        [],
      days: [],
      uniqueId: '',
      hiringPeriod: item.incubator?.hiringPeriod ?? item.accelerator?.hiringPeriod ?? '',
      openingHoursBegin: item.coworkingSpace?.openingHours?.begin ?? '',
      openingHoursEnd: item.coworkingSpace?.openingHours?.end ?? '',
      fundingModel: incOrAcc?.fundingModel ?? '',
      equityPercentage: incOrAcc?.equityPercentage?.toString() ?? '',
      investmentAmount: incOrAcc?.investmentAmount?.toString() ?? '',
      stage: incOrAcc?.stage ?? '',
      capacity: incOrAcc?.capacity?.toString() ?? '',
      programDuration: incOrAcc?.programDuration?.toString() ?? '',
      format: item.event?.format ?? '',
      attendees: item.event?.attendees?.toString() ?? '',
      prizeType: item.contest?.prizeType ?? '',
      prizeAmount: item.contest?.prizeAmount?.toString() ?? '',
      eligibility: item.contest?.eligibility ?? '',
    });
    setShowForm(true);
  };

  const buildPayload = () => {
    const spotType = form.spot;
    const base: Record<string, unknown> = {
      spot: spotType,
      name: form.name,
      highlight: form.highlight,
      address: form.address,
      description: form.description,
      url: form.url || 'https://onefive.app',
      provider: form.provider,
      location: {
        lat: parseFloat(form.lat) || 0,
        lng: parseFloat(form.lng) || 0,
      },
    };

    if (form.image) base.image = form.image;

    if (spotType === 'EVENT') {
      base.event = {
        beginDate: new Date(form.beginDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        uniqueId: form.uniqueId || `onefive-admin-${Date.now()}`,
        expertiseDomains: form.expertiseDomains.length ? form.expertiseDomains : ['TECH'],
        days: form.days.length ? form.days : ['MONDAY'],
        prices: [],
        ...(form.format ? { format: form.format } : {}),
        ...(form.attendees ? { attendees: parseInt(form.attendees) } : {}),
      };
    } else if (spotType === 'CONTEST') {
      base.contest = {
        beginDate: new Date(form.beginDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        prices: [],
        ...(form.expertiseDomains.length ? { expertiseDomains: form.expertiseDomains } : {}),
        ...(form.prizeType ? { prizeType: form.prizeType } : {}),
        ...(form.prizeAmount ? { prizeAmount: parseFloat(form.prizeAmount) } : {}),
        ...(form.eligibility ? { eligibility: form.eligibility } : {}),
      };
    } else if (spotType === 'INCUBATOR') {
      base.incubator = {
        expertiseDomains: form.expertiseDomains.length ? form.expertiseDomains : ['TECH'],
        ...(form.hiringPeriod ? { hiringPeriod: form.hiringPeriod } : {}),
        dates: [],
        prices: [],
        ...(form.fundingModel ? { fundingModel: form.fundingModel } : {}),
        ...(form.equityPercentage ? { equityPercentage: parseFloat(form.equityPercentage) } : {}),
        ...(form.investmentAmount ? { investmentAmount: parseFloat(form.investmentAmount) } : {}),
        ...(form.stage ? { stage: form.stage } : {}),
        ...(form.capacity ? { capacity: parseInt(form.capacity) } : {}),
        ...(form.programDuration ? { programDuration: parseInt(form.programDuration) } : {}),
      };
    } else if (spotType === 'ACCELERATOR') {
      base.accelerator = {
        expertiseDomains: form.expertiseDomains.length ? form.expertiseDomains : ['TECH'],
        ...(form.hiringPeriod ? { hiringPeriod: form.hiringPeriod } : {}),
        prices: [],
        ...(form.fundingModel ? { fundingModel: form.fundingModel } : {}),
        ...(form.equityPercentage ? { equityPercentage: parseFloat(form.equityPercentage) } : {}),
        ...(form.investmentAmount ? { investmentAmount: parseFloat(form.investmentAmount) } : {}),
        ...(form.stage ? { stage: form.stage } : {}),
        ...(form.capacity ? { capacity: parseInt(form.capacity) } : {}),
        ...(form.programDuration ? { programDuration: parseInt(form.programDuration) } : {}),
      };
    } else if (spotType === 'COWORKINGSPACE') {
      base.coworkingSpace = {
        ...(form.openingHoursBegin && form.openingHoursEnd
          ? { openingHours: { begin: form.openingHoursBegin, end: form.openingHoursEnd } }
          : {}),
        prices: [],
      };
    }

    return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = form.image?.trim() || undefined;
      if (imageUrl && isExternalImageUrl(imageUrl)) {
        setImportingImage(true);
        try {
          const res = await api
            .post('admin/spotlight/image/import-from-url', { json: { url: imageUrl } })
            .json<{ data: { url: string } }>();
          imageUrl = res.data?.url ?? imageUrl;
          toast.success('Image importée et optimisée');
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : 'Impossible d\'importer l\'image depuis l\'URL',
          );
          setSubmitting(false);
          setImportingImage(false);
          return;
        } finally {
          setImportingImage(false);
        }
      }

      const payload = buildPayload();
      if (imageUrl) payload.image = imageUrl;

      if (editingId) {
        await api.patch(`admin/spotlight/${editingId}`, { json: payload });
        toast.success('Spotlight mis à jour');
      } else {
        await api.post('admin/spotlight', { json: payload });
        toast.success('Spotlight créé');
      }
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (spotId: string) => {
    const ok = await confirm({
      title: 'Supprimer ce spotlight ?',
      description: 'Le spot sera supprimé définitivement.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/spotlight/${spotId}`);
      toast.success('Spotlight supprimé');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const updateField = <K extends keyof SpotFormData>(key: K, value: SpotFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <SectionHeader.Root>
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Spotlight</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Gérer les événements, concours, incubateurs, accélérateurs et espaces de coworking.
            </SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" onClick={load}>
              Rafraîchir
            </Button>
            <Button color="primary" iconLeading={Plus} onClick={openCreate}>
              Créer un spot
            </Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      {showForm && (
        <div className="mb-6 rounded-xl border border-secondary bg-secondary_subtle p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-primary">
                {editingId ? 'Modifier le spot' : 'Nouveau spot'}
              </h2>
              <p className="mt-0.5 text-sm text-tertiary">
                {editingId
                  ? 'Modifiez les informations du spot ci-dessous.'
                  : 'Remplissez les informations pour créer un nouveau spot.'}
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1.5 text-quaternary transition hover:bg-tertiary hover:text-tertiary"
            >
              <XClose className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Infos principales */}
            <fieldset className="space-y-4">
              <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                Informations générales
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    label="Nom"
                    isRequired
                    value={form.name}
                    onChange={(v) => updateField('name', v)}
                    placeholder="Ex: Station F Demo Day 2026"
                  />
                </div>
                <Input
                  label="Highlight"
                  isRequired
                  value={form.highlight}
                  onChange={(v) => updateField('highlight', v)}
                  placeholder="Ex: Le plus grand campus de startups au monde"
                />
                <Input
                  label="URL"
                  type="url"
                  isRequired
                  value={form.url}
                  onChange={(v) => updateField('url', v)}
                  placeholder="https://..."
                />
                <NativeSelect
                  label="Type de spot"
                  options={SPOT_OPTIONS}
                  value={form.spot}
                  onChange={(e) => updateField('spot', e.target.value as SpotType)}
                />
                <NativeSelect
                  label="Provider"
                  options={PROVIDER_OPTIONS}
                  value={form.provider}
                  onChange={(e) => updateField('provider', e.target.value)}
                />
                <div className="col-span-2">
                  <TextArea
                    label="Description"
                    isRequired
                    value={form.description}
                    onChange={(v) => updateField('description', v)}
                    placeholder="Décrivez le spot en quelques phrases..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Input
                    label="Image URL"
                    type="url"
                    value={form.image}
                    onChange={(v) => updateField('image', v)}
                    placeholder="https://images.example.com/... ou collez une URL Google Photos"
                    hint="Les URLs externes (Google Photos, etc.) sont automatiquement importées et optimisées à l'enregistrement."
                  />
                  {form.image && (
                    <div className="rounded-lg border border-secondary bg-secondary_subtle p-2">
                      <p className="mb-2 text-xs font-medium text-tertiary">Aperçu</p>
                      <img
                        src={form.image}
                        alt="Aperçu du spot"
                        className="h-32 w-auto max-w-full rounded-md object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Localisation */}
            <fieldset className="space-y-4">
              <legend className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-tertiary">
                <Map01 className="h-4 w-4" />
                Localisation
              </legend>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 sm:col-span-1">
                  <Input
                    label="Adresse"
                    isRequired
                    value={form.address}
                    onChange={(v) => updateField('address', v)}
                    placeholder="5 Parvis Alan Turing, Paris"
                  />
                </div>
                <Input
                  label="Latitude"
                  isRequired
                  type="number"
                  value={form.lat}
                  onChange={(v) => updateField('lat', v)}
                  placeholder="48.8566"
                />
                <Input
                  label="Longitude"
                  isRequired
                  type="number"
                  value={form.lng}
                  onChange={(v) => updateField('lng', v)}
                  placeholder="2.3522"
                />
              </div>
            </fieldset>

            {/* Champs conditionnels selon le type */}
            {needsDates(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Dates
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Début"
                    type="datetime-local"
                    isRequired
                    value={form.beginDate}
                    onChange={(v) => updateField('beginDate', v)}
                  />
                  <Input
                    label="Fin"
                    type="datetime-local"
                    isRequired
                    value={form.endDate}
                    onChange={(v) => updateField('endDate', v)}
                  />
                </div>
                {form.spot === 'EVENT' && (
                  <Input
                    label="Identifiant unique"
                    value={form.uniqueId}
                    onChange={(v) => updateField('uniqueId', v)}
                    placeholder="Laissez vide pour auto-générer"
                    hint="Identifiant unique de l'événement (auto-généré si vide)"
                  />
                )}
              </fieldset>
            )}

            {needsExpertise(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Domaines d&apos;expertise
                </legend>
                <MultiSelect
                  label="Sélectionnez un ou plusieurs domaines"
                  options={EXPERTISE_OPTIONS}
                  value={form.expertiseDomains}
                  onChange={(v) => updateField('expertiseDomains', v)}
                />
              </fieldset>
            )}

            {needsDays(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Jours
                </legend>
                <MultiSelect
                  label="Jours de l'événement"
                  options={DAY_OPTIONS}
                  value={form.days}
                  onChange={(v) => updateField('days', v)}
                />
              </fieldset>
            )}

            {needsHiringPeriod(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Période de recrutement
                </legend>
                <NativeSelect
                  label="Périodicité"
                  options={PERIODICITY_OPTIONS}
                  value={form.hiringPeriod}
                  onChange={(e) => updateField('hiringPeriod', e.target.value)}
                />
              </fieldset>
            )}

            {needsEventDetails(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Détails de l&apos;événement
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <NativeSelect
                    label="Format"
                    options={EVENT_FORMAT_OPTIONS}
                    value={form.format}
                    onChange={(e) => updateField('format', e.target.value)}
                  />
                  <Input
                    label="Nombre de participants"
                    type="number"
                    value={form.attendees}
                    onChange={(v) => updateField('attendees', v)}
                    placeholder="Ex: 200"
                  />
                </div>
              </fieldset>
            )}

            {needsContestDetails(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Détails du concours
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <NativeSelect
                    label="Type de prix"
                    options={PRIZE_TYPE_OPTIONS}
                    value={form.prizeType}
                    onChange={(e) => updateField('prizeType', e.target.value)}
                  />
                  <Input
                    label="Montant du prix (€)"
                    type="number"
                    value={form.prizeAmount}
                    onChange={(v) => updateField('prizeAmount', v)}
                    placeholder="Ex: 50000"
                  />
                  <div className="col-span-2">
                    <Input
                      label="Éligibilité"
                      value={form.eligibility}
                      onChange={(v) => updateField('eligibility', v)}
                      placeholder="Ex: Startups < 2 ans, tout secteur"
                    />
                  </div>
                </div>
              </fieldset>
            )}

            {needsFunding(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Financement & Programme
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <NativeSelect
                    label="Modèle de financement"
                    options={FUNDING_MODEL_OPTIONS}
                    value={form.fundingModel}
                    onChange={(e) => updateField('fundingModel', e.target.value)}
                  />
                  <NativeSelect
                    label="Stade de startup visé"
                    options={STARTUP_STAGE_OPTIONS}
                    value={form.stage}
                    onChange={(e) => updateField('stage', e.target.value)}
                  />
                  <Input
                    label="Equity (%)"
                    type="number"
                    value={form.equityPercentage}
                    onChange={(v) => updateField('equityPercentage', v)}
                    placeholder="Ex: 7.5"
                  />
                  <Input
                    label="Montant d'investissement (€)"
                    type="number"
                    value={form.investmentAmount}
                    onChange={(v) => updateField('investmentAmount', v)}
                    placeholder="Ex: 150000"
                  />
                  <Input
                    label="Capacité (nombre de startups)"
                    type="number"
                    value={form.capacity}
                    onChange={(v) => updateField('capacity', v)}
                    placeholder="Ex: 20"
                  />
                  <Input
                    label="Durée du programme (semaines)"
                    type="number"
                    value={form.programDuration}
                    onChange={(v) => updateField('programDuration', v)}
                    placeholder="Ex: 12"
                  />
                </div>
              </fieldset>
            )}

            {needsOpeningHours(form.spot) && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
                  Horaires d&apos;ouverture
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ouverture"
                    value={form.openingHoursBegin}
                    onChange={(v) => updateField('openingHoursBegin', v)}
                    placeholder="08:00"
                  />
                  <Input
                    label="Fermeture"
                    value={form.openingHoursEnd}
                    onChange={(v) => updateField('openingHoursEnd', v)}
                    placeholder="20:00"
                  />
                </div>
              </fieldset>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 border-t border-secondary pt-5">
              <div>
                {editingId && (
                  <Button
                    color="primary-destructive"
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      remove(editingId);
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button color="secondary" type="button" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" isDisabled={submitting} isLoading={submitting}>
                  {submitting ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer le spot'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading && <TableSkeleton columns={7} rows={5} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Aucun spotlight</EmptyState.Title>
            <EmptyState.Description>Créez votre premier spotlight.</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Adresse
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary">
                    <td className="px-4 py-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs text-quaternary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-primary">{item.name}</td>
                    <td className="px-4 py-3">
                      <Badge color="brand" size="sm">
                        {SPOT_LABELS[item.spot] ?? item.spot}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">{item.provider}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-sm text-tertiary">
                      {item.address || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`${process.env.NEXT_PUBLIC_FRONT_URL || 'http://localhost:3002'}/spotlight/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-secondary px-3 py-1.5 text-sm font-medium text-tertiary transition hover:bg-secondary"
                        >
                          Page publique
                        </a>
                        <Button color="secondary" onClick={() => openEdit(item)}>
                          Modifier
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {Math.ceil(total / PAGE_SIZE) > 1 && (
            <PaginationPageMinimalCenter
              page={page + 1}
              total={Math.ceil(total / PAGE_SIZE)}
              onPageChange={(p) => setPage(p - 1)}
              className="mt-4"
            />
          )}
        </>
      )}
    </div>
  );
}
