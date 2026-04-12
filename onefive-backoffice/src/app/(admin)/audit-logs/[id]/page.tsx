'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from '@untitledui/icons';
import { api } from '@/lib/api';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { Avatar, StartupLogo, resolveAvatarUrl } from '@/components/application/avatar/avatar';
import {
  getDiscussionUrl,
  getPostUrl,
  getProfileUrl,
  getSpotlightUrl,
  getStartupUrl,
  hasFrontendUrl,
} from '@/lib/frontend-url';

type AuditLogDetail = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  adminUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  resourcePreview: Record<string, unknown> | null;
  acceptedProfilesPreview?: AcceptedProfile[];
};

type AcceptedProfile = {
  profileId: string;
  userId?: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarId?: string | null;
};

type ResourceLink = {
  href: string;
  label: string;
  external?: boolean;
};

type InvolvedPerson = {
  key: string;
  name: string;
  subtitle?: string;
  avatarId?: string | null;
  backofficeHref?: string;
  appHref?: string;
};

const ACTION_COLORS: Record<string, 'error' | 'warning' | 'success' | 'brand' | 'gray'> = {
  DELETE: 'error',
  BAN: 'error',
  CREATE: 'success',
  UPDATE: 'brand',
  ACCEPT: 'success',
  REJECT: 'warning',
  REVOKE: 'warning',
};

function getActionColor(action: string): 'error' | 'warning' | 'success' | 'brand' | 'gray' {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.toUpperCase().includes(key)) return color;
  }
  return 'gray';
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-secondary py-3 last:border-0">
      <span className="text-sm font-medium text-tertiary">{label}</span>
      <div className="max-w-[70%] text-right text-sm text-primary">{children}</div>
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-secondary p-3 text-xs text-primary">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'string') {
    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime()) && value.includes('T')) {
      return asDate.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'medium' });
    }
    return value;
  }
  return String(value);
}

function extractInvolvedPeople(
  log: AuditLogDetail,
  acceptedProfiles: AcceptedProfile[],
): InvolvedPerson[] {
  const people: InvolvedPerson[] = [];
  const preview = log.resourcePreview as Record<string, unknown> | null;

  if (log.adminUser) {
    people.push({
      key: `admin-${log.adminUser.id}`,
      name:
        `${log.adminUser.firstName ?? ''} ${log.adminUser.lastName ?? ''}`.trim() ||
        log.adminUser.email,
      subtitle: `Admin · ${log.adminUser.email}`,
      backofficeHref: '/admins',
    });
  }

  if (preview && log.resourceType === 'user') {
    const p = preview as {
      id: string;
      email: string;
      profile?: {
        id: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
    };
    people.push({
      key: `user-${p.id}`,
      name: p.profile ? `${p.profile.firstName} ${p.profile.lastName}` : p.email,
      subtitle: p.email,
      avatarId: p.profile?.avatarId ?? null,
      backofficeHref: `/users/${p.id}`,
      appHref: p.profile?.id ? getProfileUrl(p.profile.id) : undefined,
    });
  }

  if (preview && log.resourceType === 'profile') {
    const p = preview as {
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      avatarId: string | null;
      user?: { email: string } | null;
    };
    people.push({
      key: `profile-${p.id}`,
      name: `${p.firstName} ${p.lastName}`,
      subtitle: p.user?.email ?? 'Profil',
      avatarId: p.avatarId,
      backofficeHref: `/users/${p.userId}`,
      appHref: getProfileUrl(p.id),
    });
  }

  if (preview && (log.resourceType === 'post' || log.resourceType === 'discussion')) {
    const p = preview as {
      author?: {
        userId: string;
        id?: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
    };
    if (p.author?.userId) {
      people.push({
        key: `author-${p.author.userId}`,
        name: `${p.author.firstName} ${p.author.lastName}`,
        subtitle: 'Auteur',
        avatarId: p.author.avatarId,
        backofficeHref: `/users/${p.author.userId}`,
        appHref: p.author.id ? getProfileUrl(p.author.id) : undefined,
      });
    }
  }

  if (preview && log.resourceType === 'admin_user') {
    const p = preview as {
      id?: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
    people.push({
      key: `target-admin-${p.id ?? p.email}`,
      name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email,
      subtitle: `Admin cible · ${p.email}`,
      backofficeHref: '/admins',
    });
  }

  if (preview && log.resourceType === 'report') {
    const p = preview as {
      id: string;
      reporter?: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
    };
    if (p.reporter?.userId) {
      people.push({
        key: `reporter-${p.reporter.userId}-${p.id}`,
        name: `${p.reporter.firstName} ${p.reporter.lastName}`,
        subtitle: 'Reporter',
        avatarId: p.reporter.avatarId,
        backofficeHref: `/users/${p.reporter.userId}`,
      });
    }
  }

  if (preview && log.resourceType === 'feedback') {
    const p = preview as {
      id: string;
      reporter?: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
    };
    if (p.reporter?.userId) {
      people.push({
        key: `feedback-reporter-${p.reporter.userId}-${p.id}`,
        name: `${p.reporter.firstName} ${p.reporter.lastName}`,
        subtitle: 'Reporter',
        avatarId: p.reporter.avatarId,
        backofficeHref: `/users/${p.reporter.userId}`,
      });
    }
  }

  acceptedProfiles.forEach((profile) => {
    people.push({
      key: `accepted-${profile.profileId}`,
      name: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'Profil accepté',
      subtitle: profile.email ?? 'Profil accepté',
      avatarId: profile.avatarId ?? null,
      backofficeHref: profile.userId ? `/users/${profile.userId}` : undefined,
      appHref: getProfileUrl(profile.profileId),
    });
  });

  const dedup = new Map<string, InvolvedPerson>();
  for (const person of people) {
    if (!dedup.has(person.key)) {
      dedup.set(person.key, person);
    }
  }

  return Array.from(dedup.values());
}

function ResourcePreviewCard({ log }: { log: AuditLogDetail }) {
  const preview = log.resourcePreview;

  if (!preview) {
    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu de la ressource</h3>
        <p className="mt-4 text-sm text-tertiary">Aucun aperçu disponible pour cette ressource.</p>
      </div>
    );
  }

  if (log.resourceType === 'user') {
    const user = preview as {
      id: string;
      email: string;
      isBanned: boolean;
      isEmailVerified: boolean;
      profile?: {
        id: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
        waitlistStatus: string;
      } | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu de l’utilisateur</h3>
        <div className="mt-4 flex items-start gap-4">
          <Avatar
            src={resolveAvatarUrl(user.profile?.avatarId)}
            firstName={user.profile?.firstName}
            lastName={user.profile?.lastName}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {user.profile
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : 'Utilisateur sans profil'}
            </p>
            <p className="text-sm text-tertiary">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge color={user.isBanned ? 'error' : 'success'} size="sm">
                {user.isBanned ? 'Banni' : 'Actif'}
              </Badge>
              <Badge color={user.isEmailVerified ? 'success' : 'warning'} size="sm">
                {user.isEmailVerified ? 'Email vérifié' : 'Email non vérifié'}
              </Badge>
              {user.profile?.waitlistStatus && (
                <Badge color="gray" size="sm">
                  {user.profile.waitlistStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'profile') {
    const profile = preview as {
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      avatarId: string | null;
      waitlistStatus: string;
      user?: { email: string } | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu du profil</h3>
        <div className="mt-4 flex items-start gap-4">
          <Avatar
            src={resolveAvatarUrl(profile.avatarId)}
            firstName={profile.firstName}
            lastName={profile.lastName}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-sm text-tertiary">{profile.user?.email ?? '-'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge color="gray" size="sm">
                {profile.waitlistStatus}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'post') {
    const post = preview as {
      content: string;
      isHidden: boolean;
      author?: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu du post</h3>
        {post.author && (
          <div className="mt-4 flex items-center gap-3">
            <Avatar
              src={resolveAvatarUrl(post.author.avatarId)}
              firstName={post.author.firstName}
              lastName={post.author.lastName}
              size="md"
            />
            <div>
              <p className="text-sm font-medium text-primary">
                {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-xs text-quaternary">Auteur</p>
            </div>
          </div>
        )}
        <p className="mt-4 whitespace-pre-wrap text-sm text-primary">
          {post.content || '(sans contenu)'}
        </p>
        <div className="mt-3">
          <Badge color={post.isHidden ? 'warning' : 'success'} size="sm">
            {post.isHidden ? 'Masqué' : 'Visible'}
          </Badge>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'discussion') {
    const discussion = preview as {
      question: string;
      content: string | null;
      isHidden: boolean;
      author?: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu de la discussion</h3>
        {discussion.author && (
          <div className="mt-4 flex items-center gap-3">
            <Avatar
              src={resolveAvatarUrl(discussion.author.avatarId)}
              firstName={discussion.author.firstName}
              lastName={discussion.author.lastName}
              size="md"
            />
            <div>
              <p className="text-sm font-medium text-primary">
                {discussion.author.firstName} {discussion.author.lastName}
              </p>
              <p className="text-xs text-quaternary">Auteur</p>
            </div>
          </div>
        )}
        <p className="mt-4 text-sm font-semibold text-primary">{discussion.question}</p>
        {discussion.content && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-tertiary">{discussion.content}</p>
        )}
        <div className="mt-3">
          <Badge color={discussion.isHidden ? 'warning' : 'success'} size="sm">
            {discussion.isHidden ? 'Masquée' : 'Visible'}
          </Badge>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'startup') {
    const startup = preview as {
      name: string;
      tagline: string | null;
      city: string;
      countryCode: string;
      logo: string | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu de la startup</h3>
        <div className="mt-4 flex items-start gap-4">
          <StartupLogo src={startup.logo} name={startup.name} size="lg" />
          <div>
            <p className="text-sm font-semibold text-primary">{startup.name}</p>
            {startup.tagline && <p className="text-sm text-tertiary">{startup.tagline}</p>}
            <p className="mt-1 text-xs text-quaternary">
              {startup.city}, {startup.countryCode}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'spotlight') {
    const spot = preview as {
      name: string;
      spot: string;
      provider: string;
      highlight: string | null;
      image: string | null;
      url: string;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu du spotlight</h3>
        <div className="mt-4 flex items-start gap-4">
          <Avatar src={spot.image} firstName={spot.name} lastName="" size="lg" square />
          <div>
            <p className="text-sm font-semibold text-primary">{spot.name}</p>
            <p className="text-sm text-tertiary">
              {spot.spot} · {spot.provider}
            </p>
            {spot.highlight && <p className="mt-2 text-sm text-tertiary">{spot.highlight}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'admin_user') {
    const admin = preview as {
      email: string;
      firstName: string | null;
      lastName: string | null;
      isActive: boolean;
      isSuperAdmin: boolean;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu de l’admin</h3>
        <div className="mt-4">
          <p className="text-sm font-semibold text-primary">
            {`${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || admin.email}
          </p>
          <p className="text-sm text-tertiary">{admin.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge color={admin.isActive ? 'success' : 'warning'} size="sm">
              {admin.isActive ? 'Actif' : 'Inactif'}
            </Badge>
            {admin.isSuperAdmin && <Badge color="brand" size="sm">Superadmin</Badge>}
          </div>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'admin_invitation') {
    const invitation = preview as {
      email: string;
      status: string;
      expiresAt: string;
      role?: { name: string; key: string } | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu de l’invitation</h3>
        <div className="mt-4 space-y-2 text-sm">
          <p className="font-medium text-primary">{invitation.email}</p>
          <p className="text-tertiary">Rôle : {invitation.role?.name ?? invitation.role?.key ?? '-'}</p>
          <Badge color="gray" size="sm">
            {invitation.status}
          </Badge>
        </div>
      </div>
    );
  }

  if (log.resourceType === 'report') {
    const report = preview as {
      id: string;
      status: string;
      reason: string;
      resourceType: string;
      resourceId: string;
      reporter?: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
      resourcePreview?: {
        content?: string;
      } | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu du signalement</h3>
        {report.reporter && (
          <div className="mt-4 flex items-center gap-3">
            <Avatar
              src={resolveAvatarUrl(report.reporter.avatarId)}
              firstName={report.reporter.firstName}
              lastName={report.reporter.lastName}
              size="md"
            />
            <div>
              <p className="text-sm font-medium text-primary">
                {report.reporter.firstName} {report.reporter.lastName}
              </p>
              <p className="text-xs text-quaternary">Reporter</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge color="gray" size="sm">
            {report.status}
          </Badge>
          <Badge color="warning" size="sm">
            {report.reason}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-tertiary">
          Cible: {report.resourceType} · {report.resourceId}
        </p>
        {report.resourcePreview?.content && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-primary">
            {report.resourcePreview.content}
          </p>
        )}
      </div>
    );
  }

  if (log.resourceType === 'feedback') {
    const feedback = preview as {
      id: string;
      status: string;
      type: string;
      message: string;
      reporter?: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      } | null;
    };

    return (
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h3 className="text-base font-semibold text-primary">Aperçu du feedback</h3>
        {feedback.reporter && (
          <div className="mt-4 flex items-center gap-3">
            <Avatar
              src={resolveAvatarUrl(feedback.reporter.avatarId)}
              firstName={feedback.reporter.firstName}
              lastName={feedback.reporter.lastName}
              size="md"
            />
            <div>
              <p className="text-sm font-medium text-primary">
                {feedback.reporter.firstName} {feedback.reporter.lastName}
              </p>
              <p className="text-xs text-quaternary">Reporter</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge color="gray" size="sm">
            {feedback.status}
          </Badge>
          <Badge color="brand" size="sm">
            {feedback.type}
          </Badge>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-primary">
          {feedback.message || '(sans message)'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
      <h3 className="text-base font-semibold text-primary">Aperçu de la ressource</h3>
      <div className="mt-4">
        <JsonBlock value={preview} />
      </div>
    </div>
  );
}

function buildResourceLinks(log: AuditLogDetail): ResourceLink[] {
  const links: ResourceLink[] = [];
  const metadata = log.metadata ?? {};
  const resourcePreview = log.resourcePreview as
    | {
        userId?: string;
        profile?: { id: string } | null;
      }
    | {
        userId?: string;
      }
    | null;
  const metadataUserId =
    typeof metadata.userId === 'string'
      ? metadata.userId
      : typeof metadata.targetUserId === 'string'
        ? metadata.targetUserId
        : null;
  const previewUserId =
    resourcePreview && 'userId' in resourcePreview && typeof resourcePreview.userId === 'string'
      ? resourcePreview.userId
      : resourcePreview &&
          'profile' in resourcePreview &&
          resourcePreview.profile &&
          typeof resourcePreview.profile.id === 'string'
        ? null
        : null;

  if (log.resourceType === 'user' && log.resourceId) {
    links.push({ href: `/users/${log.resourceId}`, label: 'Voir' });
  }

  if (log.resourceType === 'profile') {
    if (metadataUserId || previewUserId) {
      links.push({
        href: `/users/${metadataUserId ?? previewUserId}`,
        label: 'Voir',
      });
    }
    if (log.resourceId && hasFrontendUrl()) {
      links.push({
        href: getProfileUrl(log.resourceId),
        label: 'Voir sur l’app',
        external: true,
      });
    }
  }

  if (log.resourceType === 'post' && log.resourceId) {
    links.push({ href: `/posts/${log.resourceId}`, label: 'Voir' });
    if (hasFrontendUrl()) {
      links.push({ href: getPostUrl(log.resourceId), label: 'Voir sur l’app', external: true });
    }
  }

  if (log.resourceType === 'discussion' && log.resourceId) {
    links.push({ href: `/discussions/${log.resourceId}`, label: 'Voir' });
    if (hasFrontendUrl()) {
      links.push({
        href: getDiscussionUrl(log.resourceId),
        label: 'Voir sur l’app',
        external: true,
      });
    }
  }

  if (log.resourceType === 'startup' && log.resourceId) {
    links.push({ href: `/startups/${log.resourceId}`, label: 'Voir' });
    if (hasFrontendUrl()) {
      links.push({ href: getStartupUrl(log.resourceId), label: 'Voir sur l’app', external: true });
    }
  }

  if (log.resourceType === 'spotlight' && log.resourceId) {
    links.push({ href: '/spotlight', label: 'Voir' });
    if (hasFrontendUrl()) {
      links.push({
        href: getSpotlightUrl(log.resourceId),
        label: 'Voir sur l’app',
        external: true,
      });
    }
  }

  if (log.resourceType === 'admin_user' || log.resourceType === 'admin_invitation') {
    links.push({ href: '/admins', label: 'Voir' });
  }

  if (log.resourceType === 'report' && log.resourceId) {
    links.push({ href: `/reports/${log.resourceId}`, label: 'Voir' });
  }

  if (log.resourceType === 'feedback' && log.resourceId) {
    links.push({ href: `/feedback/${log.resourceId}`, label: 'Voir' });
  }

  return links;
}

export default function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [log, setLog] = useState<AuditLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`admin/audit-logs/${id}`).json<{ data: AuditLogDetail }>();
      setLog(response.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const acceptedProfiles = useMemo(
    () => log?.acceptedProfilesPreview ?? [],
    [log],
  );
  const metadata = useMemo(() => (log?.metadata ?? {}) as Record<string, unknown>, [log]);
  const links = useMemo(() => (log ? buildResourceLinks(log) : []), [log]);
  const involvedPeople = useMemo(
    () => (log ? extractInvolvedPeople(log, acceptedProfiles) : []),
    [log, acceptedProfiles],
  );
  const fieldChanges = useMemo(() => {
    if (!isRecord(metadata.changes)) return [];
    return Object.entries(metadata.changes).flatMap(([field, value]) => {
      if (!isRecord(value)) return [];
      return [
        {
          field,
          before: value.before,
          after: value.after,
        },
      ];
    });
  }, [metadata]);
  const bulkTargets = useMemo(() => {
    if (!Array.isArray(metadata.targets)) return [];
    return metadata.targets.filter(isRecord);
  }, [metadata]);
  const deletedUsers = useMemo(() => {
    if (!Array.isArray(metadata.deletedUsers)) return [];
    return metadata.deletedUsers.filter(isRecord);
  }, [metadata]);
  const sessionContext = useMemo(() => {
    const hasSessionData =
      metadata.sessionId !== undefined ||
      metadata.sessionFound !== undefined ||
      metadata.previousIsRevoked !== undefined ||
      metadata.sessionTokenSuffix !== undefined;
    return hasSessionData ? metadata : null;
  }, [metadata]);
  const invitationContext = useMemo(() => {
    const hasInvitationData =
      metadata.invitationId !== undefined ||
      metadata.previousInvitationStatus !== undefined ||
      metadata.invitationStatus !== undefined ||
      metadata.status !== undefined;
    return hasInvitationData ? metadata : null;
  }, [metadata]);
  const filteredMetadata = useMemo(() => {
    if (!log?.metadata) return [];
    const ignoredKeys = new Set([
      'acceptedProfiles',
      'changes',
      'changedFields',
      'targets',
      'deletedUsers',
      'sessionFound',
      'sessionId',
      'previousIsRevoked',
      'sessionExpiresAt',
      'sessionLastUsageAt',
      'sessionCreatedAt',
      'sessionTokenSuffix',
      'invitationId',
      'previousInvitationStatus',
      'invitationStatus',
      'roleKey',
      'roleName',
      'invitedByAdminId',
      'invitedByEmail',
      'acceptedByAdminId',
      'acceptedByEmail',
      'expiresAt',
      'status',
    ]);
    return Object.entries(log.metadata).filter(
      ([key, value]) => value != null && !ignoredKeys.has(key),
    );
  }, [log]);
  const timelineEvents = useMemo(() => {
    if (!log) return [];
    const transactionId =
      log.metadata && typeof log.metadata.transactionId === 'string'
        ? log.metadata.transactionId
        : null;
    return [
      {
        title: 'Action enregistrée',
        detail: new Date(log.createdAt).toLocaleString('fr-FR', {
          dateStyle: 'full',
          timeStyle: 'medium',
        }),
      },
      {
        title: 'Opération exécutée',
        detail: log.action,
      },
      {
        title: 'Ressource ciblée',
        detail: log.resourceId
          ? `${log.resourceType} · ${log.resourceId}`
          : `${log.resourceType} · aucune ressource`,
      },
      {
        title: 'Contexte technique',
        detail: `${log.ipAddress ?? 'IP inconnue'} · ${log.userAgent ?? 'User-Agent inconnu'}`,
      },
      ...(transactionId
        ? [
            {
              title: 'Transaction applicative',
              detail: transactionId,
            },
          ]
        : []),
      ...(acceptedProfiles.length > 0
        ? [
            {
              title: 'Ressources impactées',
              detail: `${acceptedProfiles.length} profil(s) accepté(s)`,
            },
          ]
        : []),
      ...(bulkTargets.length > 0
        ? [
            {
              title: 'Utilisateurs ciblés',
              detail: `${bulkTargets.length} utilisateur(s) traité(s) en bulk`,
            },
          ]
        : []),
      ...(deletedUsers.length > 0
        ? [
            {
              title: 'Utilisateurs supprimés',
              detail: `${deletedUsers.length} utilisateur(s) supprimé(s)`,
            },
          ]
        : []),
    ];
  }, [log, acceptedProfiles, bulkTargets, deletedUsers]);

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton columns={1} rows={8} />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="space-y-4">
        <Breadcrumbs className="mb-4">
          <Breadcrumbs.Item href="/audit-logs">Audit logs</Breadcrumbs.Item>
          <Breadcrumbs.Item>Log</Breadcrumbs.Item>
        </Breadcrumbs>
        <p className="text-sm text-error-primary">{error ?? 'Log introuvable'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs className="mb-4">
        <Breadcrumbs.Item href="/audit-logs">Audit logs</Breadcrumbs.Item>
        <Breadcrumbs.Item>Log</Breadcrumbs.Item>
      </Breadcrumbs>

      <SectionHeader.Root>
        <SectionHeader.Group>
          <div className="flex items-center gap-3">
            <Button
              color="secondary"
              size="sm"
              iconLeading={ArrowLeft}
              onClick={() => router.push('/audit-logs')}
            >
              Retour
            </Button>
            <div>
              <SectionHeader.Heading>Détail du log</SectionHeader.Heading>
              <SectionHeader.Subheading>ID : {log.id}</SectionHeader.Subheading>
            </div>
          </div>
          <SectionHeader.Actions>
            <Badge color={getActionColor(log.action)} size="sm">
              {log.action}
            </Badge>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <ResourcePreviewCard log={log} />

          <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
            <h3 className="text-base font-semibold text-primary">Vue d’ensemble</h3>
            <div className="mt-4">
              <InfoRow label="Action">
                <Badge color={getActionColor(log.action)} size="sm">
                  {log.action}
                </Badge>
              </InfoRow>
              <InfoRow label="Date">
                {new Date(log.createdAt).toLocaleString('fr-FR', {
                  dateStyle: 'full',
                  timeStyle: 'medium',
                })}
              </InfoRow>
              <InfoRow label="Type de ressource">{log.resourceType}</InfoRow>
              <InfoRow label="ID ressource">
                {log.resourceId ? (
                  <span className="font-mono">{log.resourceId}</span>
                ) : (
                  <span className="text-quaternary">-</span>
                )}
              </InfoRow>
              <InfoRow label="Admin">
                {log.adminUser ? (
                  <>
                    <div>{`${log.adminUser.firstName ?? ''} ${log.adminUser.lastName ?? ''}`.trim() || log.adminUser.email}</div>
                    <div className="text-quaternary">{log.adminUser.email}</div>
                  </>
                ) : (
                  'Système'
                )}
              </InfoRow>
              <InfoRow label="IP">
                {log.ipAddress ? (
                  <span className="font-mono">{log.ipAddress}</span>
                ) : (
                  <span className="text-quaternary">-</span>
                )}
              </InfoRow>
              <InfoRow label="User-Agent">
                {log.userAgent ?? <span className="text-quaternary">-</span>}
              </InfoRow>
            </div>
          </div>

          {fieldChanges.length > 0 && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">Ce qui a changé</h3>
              <div className="mt-4 space-y-3">
                {fieldChanges.map((change) => (
                  <div
                    key={change.field}
                    className="rounded-lg border border-border-secondary px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-primary">{change.field}</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-quaternary">Avant</p>
                        <p className="text-sm text-primary">{formatDetailValue(change.before)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-quaternary">Après</p>
                        <p className="text-sm text-primary">{formatDetailValue(change.after)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkTargets.length > 0 && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">
                Utilisateurs ciblés ({bulkTargets.length})
              </h3>
              <div className="mt-4 space-y-3">
                {bulkTargets.map((target, index) => (
                  <div
                    key={`${String(target.userId ?? 'target')}-${index}`}
                    className="rounded-lg border border-border-secondary px-4 py-3"
                  >
                    {(() => {
                      const firstName =
                        typeof target.firstName === 'string' ? target.firstName.trim() : '';
                      const lastName =
                        typeof target.lastName === 'string' ? target.lastName.trim() : '';
                      const fullName = `${firstName} ${lastName}`.trim();
                      const email =
                        typeof target.email === 'string' ? target.email : formatDetailValue(target.email);
                      return (
                        <>
                          <p className="text-sm font-medium text-primary">{fullName || email}</p>
                          <p className="text-sm text-tertiary">{email}</p>
                        </>
                      );
                    })()}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {typeof target.previousIsBanned === 'boolean' && (
                        <Badge color="warning" size="sm">
                          Avant: {target.previousIsBanned ? 'Banni' : 'Actif'}
                        </Badge>
                      )}
                      {typeof target.isBanned === 'boolean' && (
                        <Badge color={target.isBanned ? 'error' : 'success'} size="sm">
                          Après: {target.isBanned ? 'Banni' : 'Actif'}
                        </Badge>
                      )}
                    </div>
                    {typeof target.userId === 'string' && (
                      <div className="mt-3">
                        <Link href={`/users/${target.userId}`}>
                          <Button color="secondary" size="sm">
                            Voir utilisateur
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {deletedUsers.length > 0 && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">
                Utilisateurs supprimés ({deletedUsers.length})
              </h3>
              <div className="mt-4 space-y-3">
                {deletedUsers.map((user, index) => (
                  <div
                    key={`${String(user.userId ?? 'deleted')}-${index}`}
                    className="rounded-lg border border-border-secondary px-4 py-3"
                  >
                    {(() => {
                      const firstName = typeof user.firstName === 'string' ? user.firstName.trim() : '';
                      const lastName = typeof user.lastName === 'string' ? user.lastName.trim() : '';
                      const fullName = `${firstName} ${lastName}`.trim();
                      const email =
                        typeof user.email === 'string' ? user.email : formatDetailValue(user.email);
                      return (
                        <>
                          <p className="text-sm font-medium text-primary">{fullName || email}</p>
                          <p className="text-sm text-tertiary">{email}</p>
                        </>
                      );
                    })()}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {typeof user.isBanned === 'boolean' && (
                        <Badge color={user.isBanned ? 'error' : 'success'} size="sm">
                          {user.isBanned ? 'Banni' : 'Actif'}
                        </Badge>
                      )}
                      {typeof user.isEmailVerified === 'boolean' && (
                        <Badge color={user.isEmailVerified ? 'success' : 'warning'} size="sm">
                          {user.isEmailVerified ? 'Email vérifié' : 'Email non vérifié'}
                        </Badge>
                      )}
                      {typeof user.waitlistStatus === 'string' && (
                        <Badge color="gray" size="sm">
                          {user.waitlistStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessionContext && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">Contexte session</h3>
              <div className="mt-4">
                <InfoRow label="Session trouvée">
                  {formatDetailValue(sessionContext.sessionFound)}
                </InfoRow>
                <InfoRow label="Session ID">{formatDetailValue(sessionContext.sessionId)}</InfoRow>
                <InfoRow label="Token (suffix)">
                  {formatDetailValue(sessionContext.sessionTokenSuffix)}
                </InfoRow>
                <InfoRow label="Révoquée avant action">
                  {formatDetailValue(sessionContext.previousIsRevoked)}
                </InfoRow>
                <InfoRow label="Expiration session">
                  {formatDetailValue(sessionContext.sessionExpiresAt)}
                </InfoRow>
                <InfoRow label="Dernier usage session">
                  {formatDetailValue(sessionContext.sessionLastUsageAt)}
                </InfoRow>
              </div>
            </div>
          )}

          {invitationContext && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">Cycle de l’invitation</h3>
              <div className="mt-4">
                <InfoRow label="Invitation ID">
                  {formatDetailValue(invitationContext.invitationId)}
                </InfoRow>
                <InfoRow label="Statut précédent">
                  {formatDetailValue(
                    invitationContext.previousInvitationStatus ?? invitationContext.previousStatus,
                  )}
                </InfoRow>
                <InfoRow label="Nouveau statut">
                  {formatDetailValue(invitationContext.invitationStatus ?? invitationContext.status)}
                </InfoRow>
                <InfoRow label="Rôle">{formatDetailValue(invitationContext.roleName)}</InfoRow>
                <InfoRow label="Expire le">{formatDetailValue(invitationContext.expiresAt)}</InfoRow>
                <InfoRow label="Invitée par">
                  {formatDetailValue(invitationContext.invitedByEmail)}
                </InfoRow>
                <InfoRow label="Acceptée par">
                  {formatDetailValue(invitationContext.acceptedByEmail)}
                </InfoRow>
              </div>
            </div>
          )}

          {filteredMetadata.length > 0 && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">Metadata</h3>
              <div className="mt-4 space-y-4">
                {filteredMetadata.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-semibold uppercase text-quaternary">{key}</p>
                    <div className="mt-2 text-sm text-primary">
                      {typeof value === 'object' && value !== null ? (
                        <JsonBlock value={value} />
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {acceptedProfiles.length > 0 && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">
                Profils acceptés ({acceptedProfiles.length})
              </h3>
              <div className="mt-4 space-y-3">
                {acceptedProfiles.map((profile) => (
                  <div
                    key={profile.profileId}
                    className="flex flex-col gap-3 rounded-lg border border-border-secondary px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={resolveAvatarUrl(profile.avatarId)}
                        firstName={profile.firstName}
                        lastName={profile.lastName}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {`${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'Profil'}
                        </p>
                        <p className="text-sm text-tertiary">{profile.email ?? '-'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.userId && (
                        <Link href={`/users/${profile.userId}`}>
                          <Button color="secondary" size="sm">
                            Voir
                          </Button>
                        </Link>
                      )}
                      {hasFrontendUrl() && (
                        <Button
                          color="secondary"
                          size="sm"
                          iconTrailing={ArrowUpRight}
                          href={getProfileUrl(profile.profileId)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir sur l&apos;app
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
            <h3 className="text-base font-semibold text-primary">Actions liées</h3>
            <div className="mt-4 flex flex-col gap-2">
              {links.length > 0 ? (
                links.map((link) =>
                  link.external ? (
                    <Button
                      key={`${link.href}-${link.label}`}
                      color="secondary"
                      size="sm"
                      iconTrailing={ArrowUpRight}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </Button>
                  ) : (
                    <Link key={`${link.href}-${link.label}`} href={link.href}>
                      <Button color="secondary" size="sm" className="w-full">
                        {link.label}
                      </Button>
                    </Link>
                  ),
                )
              ) : (
                <p className="text-sm text-tertiary">Aucun lien direct disponible pour ce log.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
            <h3 className="text-base font-semibold text-primary">Personnes impliquées</h3>
            <div className="mt-4 space-y-3">
              {involvedPeople.length > 0 ? (
                involvedPeople.map((person) => (
                  <div
                    key={person.key}
                    className="rounded-lg border border-border-secondary px-3 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={resolveAvatarUrl(person.avatarId)}
                        firstName={person.name}
                        lastName=""
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-primary">{person.name}</p>
                        {person.subtitle && (
                          <p className="mt-0.5 text-xs text-tertiary">{person.subtitle}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {person.backofficeHref && (
                            <Link href={person.backofficeHref}>
                              <Button color="secondary" size="sm">
                                Voir
                              </Button>
                            </Link>
                          )}
                          {person.appHref && hasFrontendUrl() && (
                            <Button
                              color="secondary"
                              size="sm"
                              iconTrailing={ArrowUpRight}
                              href={person.appHref}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Voir sur l'app
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-tertiary">Aucune personne identifiée pour ce log.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
            <h3 className="text-base font-semibold text-primary">Timeline</h3>
            <div className="mt-4 space-y-3">
              {timelineEvents.map((event, index) => (
                <div key={`${event.title}-${index}`} className="flex items-start gap-3">
                  <div className="mt-1 flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                    {index < timelineEvents.length - 1 && (
                      <span className="mt-1 h-8 w-px bg-border-secondary" />
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="text-sm font-medium text-primary">{event.title}</p>
                    <p className="text-sm text-tertiary">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {log.metadata && (
            <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
              <h3 className="text-base font-semibold text-primary">JSON brut</h3>
              <div className="mt-4">
                <JsonBlock value={log.metadata} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
