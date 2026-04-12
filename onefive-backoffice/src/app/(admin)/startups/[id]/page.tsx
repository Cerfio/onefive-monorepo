'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs';
import { ArrowLeft, ArrowUpRight, Trash01 } from '@untitledui/icons';
import { getStartupUrl, hasFrontendUrl } from '@/lib/frontend-url';
import { Avatar, StartupLogo, resolveAvatarUrl } from '@/components/application/avatar/avatar';

type StartupDetail = {
  id: string;
  name: string;
  categories: string[];
  description: string | null;
  countryCode: string;
  city: string;
  teamSize: number | null;
  investorsCount: number | null;
  partnersCount: number | null;
  createdAt: string;
  updatedAt: string;
  coverImage: string | null;
  foundedDate: string | null;
  linkedin: string | null;
  logo: string | null;
  tagline: string | null;
  website: string | null;
  members: {
    id: string;
    position: string;
    role: string;
    isFounder: boolean;
    equity: number;
    profile: { id: string; firstName: string; lastName: string; userId: string; avatarId: string | null };
  }[];
  dataroom: { id: string; _count: { files: number; members: number; groups: number } } | null;
  fundingInfo: {
    totalRaised: string | null;
    lastRound: string | null;
    investors: string[];
    fundraisingType: string | null;
  } | null;
  _count: { followedBy: number; hiring: number; views: number };
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-48 animate-pulse rounded-md bg-quaternary/40" />
      <div className="flex gap-4">
        <div className="h-16 w-16 animate-pulse rounded-xl bg-quaternary/40" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-64 animate-pulse rounded-md bg-quaternary/40" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-quaternary/40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-secondary p-4 shadow-xs ring-1 ring-secondary">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 animate-pulse rounded-md bg-quaternary/40" />
              <div className="h-5 w-12 animate-pulse rounded-md bg-quaternary/40" />
            </div>
          </div>
        ))}
      </div>
      <TableSkeleton columns={4} rows={5} />
    </div>
  );
}

export default function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirm();
  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`admin/startups/${id}`)
        .json<{ data: StartupDetail }>();
      setStartup(response.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer cette startup ?',
      description: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/startups/${id}`);
      toast.success('Startup supprimée');
      router.push('/startups');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-48 animate-pulse rounded-md bg-quaternary/40" />
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="space-y-6">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/startups">Startups</Breadcrumbs.Item>
          <Breadcrumbs.Item>Erreur</Breadcrumbs.Item>
        </Breadcrumbs>
        <div className="rounded-xl bg-error-secondary p-8 text-center">
          <p className="text-sm text-error-primary">{error ?? 'Startup non trouvée'}</p>
          <Button
            color="secondary"
            size="sm"
            className="mt-4"
            iconLeading={ArrowLeft}
            onClick={() => router.push('/startups')}
          >
            Retour aux startups
          </Button>
        </div>
      </div>
    );
  }

  const cardClass = 'rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset md:p-5';

  return (
    <div className="space-y-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/startups">Startups</Breadcrumbs.Item>
        <Breadcrumbs.Item current>{startup.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <StartupLogo src={startup.logo} name={startup.name} size="xl" />
          <div>
            <h1 className="text-xl font-semibold text-primary">{startup.name}</h1>
            {startup.tagline && (
              <p className="mt-0.5 text-sm text-tertiary">{startup.tagline}</p>
            )}
            <p className="mt-1 text-sm text-quaternary">
              {startup.city}, {startup.countryCode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasFrontendUrl() && (
            <Button
              color="secondary"
              size="sm"
              iconTrailing={ArrowUpRight}
              href={getStartupUrl(startup.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir sur l&apos;app
            </Button>
          )}
          <Button
            color="secondary"
            size="sm"
            iconLeading={ArrowLeft}
            onClick={() => router.push('/startups')}
          >
            Retour
          </Button>
          <Button
            color="primary-destructive"
            size="sm"
            iconLeading={Trash01}
            onClick={handleDelete}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            Catégories
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {startup.categories?.length ? (
              startup.categories.map((cat) => (
                <Badge key={cat} color="gray" size="sm">
                  {cat}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-quaternary">-</span>
            )}
          </div>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            Taille équipe
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {startup.teamSize ?? '-'}
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            Investisseurs
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {startup.investorsCount ?? '-'}
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            Partenaires
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {startup.partnersCount ?? '-'}
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            Date de création
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {startup.foundedDate
              ? new Date(startup.foundedDate).toLocaleDateString('fr-FR')
              : '-'}
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            Site web
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {startup.website ? (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-secondary hover:text-brand-secondary_hover"
              >
                {startup.website}
              </a>
            ) : (
              '-'
            )}
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            LinkedIn
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {startup.linkedin ? (
              <a
                href={startup.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-secondary hover:text-brand-secondary_hover"
              >
                {startup.linkedin}
              </a>
            ) : (
              '-'
            )}
          </p>
        </div>
      </div>

      {/* Members */}
      <div className={cardClass}>
        <h3 className="text-base font-semibold text-primary">Équipe</h3>
        {startup.members?.length ? (
          <div className="mt-4 overflow-x-auto rounded-lg bg-secondary">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Membre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Poste
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Fondateur
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {startup.members.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-secondary">
                    <td className="px-4 py-3">
                      <Link
                        href={`/users/${member.profile.userId}`}
                        className="flex items-center gap-2 font-medium text-brand-secondary hover:text-brand-secondary_hover"
                      >
                        <Avatar
                          src={resolveAvatarUrl(member.profile.avatarId)}
                          firstName={member.profile.firstName}
                          lastName={member.profile.lastName}
                          size="xs"
                        />
                        {member.profile.firstName} {member.profile.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">
                      {member.position || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">
                      {member.role || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {member.isFounder ? (
                        <Badge color="brand" size="sm">
                          Fondateur
                        </Badge>
                      ) : (
                        <span className="text-xs text-quaternary">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-quaternary">Aucun membre</p>
        )}
      </div>

      {/* Dataroom */}
      {startup.dataroom && (
        <div className={cardClass}>
          <h3 className="text-base font-semibold text-primary">Dataroom</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
                Fichiers
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {startup.dataroom._count.files}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
                Membres
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {startup.dataroom._count.members}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
                Groupes
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {startup.dataroom._count.groups}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Funding */}
      {startup.fundingInfo && (
        <div className={cardClass}>
          <h3 className="text-base font-semibold text-primary">Financement</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
                Levée totale
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {startup.fundingInfo.totalRaised ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
                Dernier tour
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {startup.fundingInfo.lastRound ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
                Type de levée
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {startup.fundingInfo.fundraisingType ?? '-'}
              </p>
            </div>
            {startup.fundingInfo.investors?.length ? (
              <div className="col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
                  Investisseurs
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {startup.fundingInfo.investors.map((inv) => (
                    <Badge key={inv} color="gray" size="sm">
                      {inv}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={cardClass}>
        <h3 className="text-base font-semibold text-primary">Statistiques</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
              Abonnés
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {startup._count.followedBy}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
              Offres recrutement
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {startup._count.hiring}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
              Vues
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {startup._count.views}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
