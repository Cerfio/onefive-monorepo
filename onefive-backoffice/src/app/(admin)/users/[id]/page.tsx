'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { ArrowLeft, ArrowUpRight } from '@untitledui/icons';
import { getProfileUrl, hasFrontendUrl } from '@/lib/frontend-url';
import { Avatar, StartupLogo, resolveAvatarUrl } from '@/components/application/avatar/avatar';

type UserDetail = {
  id: string;
  email: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  authType: string;
  phoneNumber: string | null;
  createdAt: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    countryCode: string;
    city: string;
    bio: string | null;
    highlight: string | null;
    skills: string[];
    roles: string[];
    ecosystemRoles: string[];
    avatarId: string | null;
    linkedinUrl: string | null;
    waitlistStatus: string;
    activatedAt: string | null;
    isAmbassador: boolean;
    referralCode: string;
    showInLeaderboard: boolean;
    createdAt: string;
    referrer: { id: string; firstName: string; lastName: string } | null;
    referredBy: { id: string; firstName: string; lastName: string }[];
    posts: {
      id: string;
      content: string;
      isHidden: boolean;
      createdAt: string;
      _count: { comments: number; reactions: number };
    }[];
    discussions: {
      id: string;
      question: string;
      isHidden: boolean;
      createdAt: string;
      _count: { answers: number; upvotes: number };
    }[];
    postComments: {
      id: string;
      content: string;
      createdAt: string;
      post: { id: string; content: string };
      _count: { reactions: number; replies: number };
    }[];
    discussionAnswers: {
      id: string;
      content: string;
      createdAt: string;
      discussion: { id: string; question: string };
      _count: { reactions: number; upvotes: number; replies: number };
    }[];
    startups: {
      position: string;
      role: string;
      isFounder: boolean;
      startup: {
        id: string;
        name: string;
        city: string;
        countryCode: string;
        categories: string[];
        tagline: string | null;
        logo: string | null;
      };
    }[];
    relationshipRequest: { accepter: { id: string; firstName: string; lastName: string } }[];
    relationshipAccepter: { requester: { id: string; firstName: string; lastName: string } }[];
    reportsSubmitted: {
      id: string;
      resourceType: string;
      resourceId: string;
      reason: string;
      message: string | null;
      status: string;
      createdAt: string;
    }[];
    reportsReceived: {
      id: string;
      resourceType: string;
      resourceId: string;
      reason: string;
      message: string | null;
      status: string;
      createdAt: string;
      reporter: {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        avatarId: string | null;
      };
    }[];
    feedbackSubmitted: {
      id: string;
      type: string;
      message: string;
      url: string | null;
      status: string;
      createdAt: string;
    }[];
  } | null;
};

type Tab = 'posts' | 'comments' | 'discussions' | 'answers' | 'startups' | 'relations' | 'reports' | 'reportsReceived' | 'feedback';

const TABS: { key: Tab; label: string }[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'comments', label: 'Commentaires' },
  { key: 'discussions', label: 'Discussions' },
  { key: 'answers', label: 'Réponses' },
  { key: 'startups', label: 'Startups' },
  { key: 'relations', label: 'Relations' },
  { key: 'reports', label: 'Signalements envoyés' },
  { key: 'reportsReceived', label: 'Signalements reçus' },
  { key: 'feedback', label: 'Feedback' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-secondary py-3 last:border-0">
      <span className="text-sm font-medium text-tertiary">{label}</span>
      <span className="text-right text-sm text-primary">{children}</span>
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirm();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`admin/users/${id}`)
        .json<{ data: UserDetail }>();
      setUser(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const toggleBan = async () => {
    if (!user) return;
    const ok = await confirm({
      title: user.isBanned ? 'Débannir cet utilisateur ?' : 'Bannir cet utilisateur ?',
      description: user.isBanned
        ? "L'utilisateur pourra à nouveau accéder à la plateforme."
        : "L'utilisateur ne pourra plus accéder à la plateforme.",
      confirmLabel: user.isBanned ? 'Débannir' : 'Bannir',
      variant: user.isBanned ? 'info' : 'warning',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/users/${id}/ban`, { json: { isBanned: !user.isBanned } }).json();
      toast.success(user.isBanned ? 'Utilisateur débanni' : 'Utilisateur banni');
      await loadUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du ban');
    }
  };

  const toggleAmbassador = async () => {
    if (!user?.profile) return;
    const next = !user.profile.isAmbassador;
    try {
      await api.patch(`admin/users/${id}/ambassador`, { json: { isAmbassador: next } }).json();
      toast.success(next ? 'Statut Ambassadeur accordé' : 'Statut Ambassadeur retiré');
      await loadUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleVerifyEmail = async () => {
    if (!user || user.isEmailVerified) return;
    try {
      await api.patch(`admin/users/${id}/verify-email`).json();
      toast.success('Email marqué comme vérifié');
      await loadUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleWaitlistStatus = async (waitlistStatus: 'WAITING' | 'ACTIVE' | 'IGNORED') => {
    try {
      await api.patch(`admin/users/${id}/waitlist-status`, { json: { waitlistStatus } }).json();
      toast.success('Statut waitlist mis à jour');
      await loadUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const deleteUser = async () => {
    const ok = await confirm({
      title: 'Supprimer cet utilisateur ?',
      description: 'Cette action est irréversible. Toutes les données de cet utilisateur seront supprimées.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/users/${id}`);
      toast.success('Utilisateur supprimé');
      router.push('/users');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-5 w-48 animate-pulse rounded bg-secondary" />
        </div>
        <TableSkeleton columns={4} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-sm text-error-primary">{error}</p>
        <Button color="secondary" onClick={loadUser}>Réessayer</Button>
      </div>
    );
  }

  if (!user) return null;

  const profile = user.profile;
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user.email;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-tertiary">
        <Link href="/users" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
          <ArrowLeft className="size-4" />
          Utilisateurs
        </Link>
        <span>/</span>
        <span className="font-medium text-primary">{displayName}</span>
      </div>

      {/* Header actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-primary">{displayName}</h1>
        <div className="flex flex-wrap gap-2">
          {hasFrontendUrl() && profile && (
            <Button
              color="secondary"
              size="sm"
              iconTrailing={ArrowUpRight}
              href={getProfileUrl(profile.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir sur l&apos;app
            </Button>
          )}
          {profile && !user.isEmailVerified && (
            <Button color="secondary" size="sm" onClick={handleVerifyEmail}>
              Vérifier l&apos;email
            </Button>
          )}
          {profile && (
            <Button color="secondary" size="sm" onClick={toggleAmbassador}>
              {profile.isAmbassador ? 'Retirer ambassadeur' : 'Promouvoir ambassadeur'}
            </Button>
          )}
          {profile && (
            <div className="flex gap-1">
              {(['WAITING', 'ACTIVE', 'IGNORED'] as const).filter(
                (s) => s !== profile.waitlistStatus
              ).map((s) => (
                <Button
                  key={s}
                  color="secondary"
                  size="sm"
                  onClick={() => handleWaitlistStatus(s)}
                >
                  {s === 'ACTIVE' ? 'Accepter' : s === 'IGNORED' ? 'Ignorer' : 'En attente'}
                </Button>
              ))}
            </div>
          )}
          <Button color="secondary" size="sm" onClick={toggleBan}>
            {user.isBanned ? 'Débannir' : 'Bannir'}
          </Button>
          <Button color="primary-destructive" size="sm" onClick={deleteUser}>
            Supprimer
          </Button>
        </div>
      </div>

      {/* Profile card */}
      <div className="mb-8 rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="flex items-center gap-4 border-b border-border-secondary px-6 py-4">
          <Avatar
            src={resolveAvatarUrl(profile?.avatarId)}
            firstName={profile?.firstName}
            lastName={profile?.lastName}
            size="lg"
          />
          <div>
            <h2 className="text-base font-semibold text-primary">{displayName}</h2>
            <p className="text-sm text-tertiary">{user.email}</p>
          </div>
        </div>
        <div className="grid gap-x-12 gap-y-0 px-6 py-2 md:grid-cols-2">
          <InfoRow label="Email">{user.email}</InfoRow>
          <InfoRow label="Téléphone">{user.phoneNumber || '—'}</InfoRow>
          <InfoRow label="Ville / Pays">
            {profile ? `${profile.city}, ${profile.countryCode}` : '—'}
          </InfoRow>
          <InfoRow label="Genre">{profile?.gender || '—'}</InfoRow>
          <InfoRow label="Date de naissance">
            {profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'}
          </InfoRow>
          <InfoRow label="Type d'auth">{user.authType}</InfoRow>
          <InfoRow label="Email vérifié">
            {user.isEmailVerified ? (
              <Badge color="success" size="sm">Vérifié</Badge>
            ) : (
              <Badge color="warning" size="sm">Non vérifié</Badge>
            )}
          </InfoRow>
          <InfoRow label="Statut ban">
            {user.isBanned ? (
              <Badge color="error" size="sm">Banni</Badge>
            ) : (
              <Badge color="success" size="sm">Actif</Badge>
            )}
          </InfoRow>
          <InfoRow label="Waitlist">
            {profile?.waitlistStatus ? (
              <Badge
                color={
                  profile.waitlistStatus === 'ACTIVE'
                    ? 'success'
                    : profile.waitlistStatus === 'WAITING'
                      ? 'warning'
                      : 'gray'
                }
                size="sm"
              >
                {profile.waitlistStatus}
              </Badge>
            ) : (
              '—'
            )}
          </InfoRow>
          <InfoRow label="Ambassadeur">
            {profile?.isAmbassador ? (
              <Badge color="brand" size="sm">Oui</Badge>
            ) : (
              'Non'
            )}
          </InfoRow>
          <InfoRow label="Code parrainage">{profile?.referralCode || '—'}</InfoRow>
          <InfoRow label="LinkedIn">
            {profile?.linkedinUrl ? (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                Voir le profil
              </a>
            ) : (
              '—'
            )}
          </InfoRow>
          <InfoRow label="Inscrit le">{formatDate(user.createdAt)}</InfoRow>
          <InfoRow label="Activé le">
            {profile?.activatedAt ? formatDate(profile.activatedAt) : '—'}
          </InfoRow>
        </div>

        {/* Skills, roles, ecosystemRoles */}
        {profile && (profile.skills.length > 0 || profile.roles.length > 0 || profile.ecosystemRoles.length > 0) && (
          <div className="border-t border-border-secondary px-6 py-4">
            {profile.skills.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-semibold uppercase text-quaternary">Compétences</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <Badge key={s} color="brand" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.roles.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-semibold uppercase text-quaternary">Rôles</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.roles.map((r) => (
                    <Badge key={r} color="indigo" size="sm">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.ecosystemRoles.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase text-quaternary">Rôles écosystème</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.ecosystemRoles.map((r) => (
                    <Badge key={r} color="purple" size="sm">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {profile?.bio && (
          <div className="border-t border-border-secondary px-6 py-4">
            <p className="mb-1 text-xs font-semibold uppercase text-quaternary">Bio</p>
            <p className="whitespace-pre-line text-sm text-secondary">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border-secondary">
        {TABS.map((tab) => {
          const count =
            tab.key === 'posts' ? (profile?.posts?.length ?? 0) :
            tab.key === 'comments' ? (profile?.postComments?.length ?? 0) :
            tab.key === 'discussions' ? (profile?.discussions?.length ?? 0) :
            tab.key === 'answers' ? (profile?.discussionAnswers?.length ?? 0) :
            tab.key === 'startups' ? (profile?.startups?.length ?? 0) :
            tab.key === 'relations' ? ((profile?.relationshipRequest?.length ?? 0) + (profile?.relationshipAccepter?.length ?? 0)) :
            tab.key === 'reports' ? (profile?.reportsSubmitted?.length ?? 0) :
            tab.key === 'reportsReceived' ? (profile?.reportsReceived?.length ?? 0) :
            tab.key === 'feedback' ? (profile?.feedbackSubmitted?.length ?? 0) : 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'text-brand-primary' : 'text-tertiary hover:text-primary'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  activeTab === tab.key ? 'bg-brand-solid/10 text-brand-primary' : 'bg-secondary text-quaternary'
                }`}>
                  {count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-solid" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'posts' && <PostsTab posts={profile?.posts ?? []} />}
      {activeTab === 'comments' && <CommentsTab comments={profile?.postComments ?? []} />}
      {activeTab === 'discussions' && <DiscussionsTab discussions={profile?.discussions ?? []} />}
      {activeTab === 'answers' && <AnswersTab answers={profile?.discussionAnswers ?? []} />}
      {activeTab === 'startups' && <StartupsTab startups={profile?.startups ?? []} />}
      {activeTab === 'relations' && (
        <RelationsTab
          referrer={profile?.referrer ?? null}
          referredBy={profile?.referredBy ?? []}
          requested={profile?.relationshipRequest ?? []}
          accepted={profile?.relationshipAccepter ?? []}
        />
      )}
      {activeTab === 'reports' && <ReportsTab reports={profile?.reportsSubmitted ?? []} />}
      {activeTab === 'reportsReceived' && (
        <ReportsReceivedTab reports={profile?.reportsReceived ?? []} />
      )}
      {activeTab === 'feedback' && <FeedbackTab feedback={profile?.feedbackSubmitted ?? []} />}
    </div>
  );
}

/* ─── Tab: Posts ──────────────────────────────────────────── */

function PostsTab({
  posts,
}: {
  posts: UserDetail['profile'] extends infer P ? P extends { posts: infer T } ? T : never : never;
}) {
  if (posts.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucun post.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Contenu</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Engagement</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {posts.map((post) => (
            <tr key={post.id} className="transition-colors hover:bg-secondary">
              <td className="max-w-xs px-4 py-3">
                <Link href={`/posts/${post.id}`} className="block">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm text-primary">{post.content?.slice(0, 100) || '(vide)'}</p>
                    {post.isHidden && <Badge color="warning" size="sm">Masqué</Badge>}
                  </div>
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex gap-2">
                  <Badge color="gray" size="sm">{post._count.comments} com.</Badge>
                  <Badge color="gray" size="sm">{post._count.reactions} réac.</Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {formatDate(post.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Comments ─────────────────────────────────────── */

function CommentsTab({
  comments,
}: {
  comments: NonNullable<UserDetail['profile']>['postComments'];
}) {
  if (comments.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucun commentaire.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Commentaire</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Sur le post</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Engagement</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {comments.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-secondary">
              <td className="max-w-xs px-4 py-3">
                <p className="truncate text-sm text-primary">{c.content}</p>
              </td>
              <td className="max-w-xs px-4 py-3">
                <Link href={`/posts/${c.post.id}`} className="block">
                  <p className="truncate text-sm text-brand-primary hover:underline">
                    {c.post.content?.slice(0, 80) || '(vide)'}
                  </p>
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex gap-2">
                  <Badge color="gray" size="sm">{c._count.reactions} réac.</Badge>
                  <Badge color="gray" size="sm">{c._count.replies} rép.</Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {formatDate(c.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Discussions ───────────────────────────────────── */

function DiscussionsTab({
  discussions,
}: {
  discussions: NonNullable<UserDetail['profile']>['discussions'];
}) {
  if (discussions.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucune discussion.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Question</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Engagement</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {discussions.map((d) => (
            <tr key={d.id} className="transition-colors hover:bg-secondary">
              <td className="max-w-xs px-4 py-3">
                <Link href={`/discussions/${d.id}`} className="block">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm text-primary">{d.question}</p>
                    {d.isHidden && <Badge color="warning" size="sm">Masqué</Badge>}
                  </div>
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex gap-2">
                  <Badge color="gray" size="sm">{d._count.answers} rép.</Badge>
                  <Badge color="gray" size="sm">{d._count.upvotes} votes</Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {formatDate(d.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Answers ───────────────────────────────────────── */

function AnswersTab({
  answers,
}: {
  answers: NonNullable<UserDetail['profile']>['discussionAnswers'];
}) {
  if (answers.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucune réponse.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Réponse</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">À la question</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Engagement</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {answers.map((a) => (
            <tr key={a.id} className="transition-colors hover:bg-secondary">
              <td className="max-w-xs px-4 py-3">
                <p className="truncate text-sm text-primary">{a.content}</p>
              </td>
              <td className="max-w-xs px-4 py-3">
                <Link href={`/discussions/${a.discussion.id}`} className="block">
                  <p className="truncate text-sm text-brand-primary hover:underline">
                    {a.discussion.question}
                  </p>
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex gap-2">
                  {a._count.upvotes > 0 && (
                    <Badge color="brand" size="sm">👍 {a._count.upvotes}</Badge>
                  )}
                  <Badge color="gray" size="sm">{a._count.reactions} réac.</Badge>
                  <Badge color="gray" size="sm">{a._count.replies} rép.</Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {formatDate(a.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Startups ──────────────────────────────────────── */

function StartupsTab({
  startups,
}: {
  startups: NonNullable<UserDetail['profile']>['startups'];
}) {
  if (startups.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucune startup.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Startup</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Rôle / Poste</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Catégories</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Localisation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {startups.map((s) => (
            <tr key={s.startup.id} className="transition-colors hover:bg-secondary">
              <td className="px-4 py-3">
                <Link href={`/startups/${s.startup.id}`} className="flex items-center gap-3">
                  <StartupLogo src={s.startup.logo} name={s.startup.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-primary">{s.startup.name}</p>
                    {s.startup.tagline && (
                      <p className="truncate text-xs text-quaternary">{s.startup.tagline}</p>
                    )}
                  </div>
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary">{s.position || s.role}</span>
                  {s.isFounder && <Badge color="brand" size="sm">Fondateur</Badge>}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {s.startup.categories.map((c) => (
                    <Badge key={c} color="gray" size="sm">{c}</Badge>
                  ))}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {s.startup.city}, {s.startup.countryCode}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Relations ─────────────────────────────────────── */

function RelationsTab({
  referrer,
  referredBy,
  requested,
  accepted,
}: {
  referrer: NonNullable<UserDetail['profile']>['referrer'];
  referredBy: NonNullable<UserDetail['profile']>['referredBy'];
  requested: NonNullable<UserDetail['profile']>['relationshipRequest'];
  accepted: NonNullable<UserDetail['profile']>['relationshipAccepter'];
}) {
  const allRelations = [
    ...requested.map((r) => ({ ...r.accepter, type: 'Demandée' as const })),
    ...accepted.map((r) => ({ ...r.requester, type: 'Acceptée' as const })),
  ];

  return (
    <div className="space-y-6">
      {/* Referrer */}
      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="border-b border-border-secondary px-6 py-4">
          <h3 className="text-sm font-semibold text-primary">Parrain</h3>
        </div>
        <div className="px-6 py-4">
          {referrer ? (
            <Link href={`/users/${referrer.id}`} className="text-sm font-medium text-brand-primary hover:underline">
              {referrer.firstName} {referrer.lastName}
            </Link>
          ) : (
            <p className="text-sm text-quaternary">Aucun parrain.</p>
          )}
        </div>
      </div>

      {/* Referred users */}
      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="border-b border-border-secondary px-6 py-4">
          <h3 className="text-sm font-semibold text-primary">
            Filleuls ({referredBy.length})
          </h3>
        </div>
        {referredBy.length === 0 ? (
          <div className="px-6 py-4">
            <p className="text-sm text-quaternary">Aucun filleul.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-secondary">
            {referredBy.map((r) => (
              <li key={r.id} className="px-6 py-3">
                <Link href={`/users/${r.id}`} className="text-sm font-medium text-brand-primary hover:underline">
                  {r.firstName} {r.lastName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Relationships */}
      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="border-b border-border-secondary px-6 py-4">
          <h3 className="text-sm font-semibold text-primary">
            Relations acceptées ({allRelations.length})
          </h3>
        </div>
        {allRelations.length === 0 ? (
          <div className="px-6 py-4">
            <p className="text-sm text-quaternary">Aucune relation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {allRelations.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-secondary">
                    <td className="px-4 py-3">
                      <Link href={`/users/${r.id}`} className="text-sm font-medium text-brand-primary hover:underline">
                        {r.firstName} {r.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={r.type === 'Demandée' ? 'blue' : 'success'} size="sm">
                        {r.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Tab: Reports ───────────────────────────────────────── */

const REPORT_STATUS_COLORS: Record<string, 'warning' | 'success' | 'gray'> = {
  PENDING: 'warning',
  RESOLVED: 'success',
  DISMISSED: 'gray',
};

const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  RESOLVED: 'Résolu',
  DISMISSED: 'Rejeté',
};

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harcèlement',
  INAPPROPRIATE_CONTENT: 'Contenu inapproprié',
  MISINFORMATION: 'Désinformation',
  IMPERSONATION: 'Usurpation',
  OTHER: 'Autre',
};

const RESOURCE_LABELS: Record<string, string> = {
  PROFILE: 'Profil',
  POST: 'Post',
  POST_COMMENT: 'Commentaire',
  POST_COMMENT_REPLY: 'Réponse (post)',
  DISCUSSION: 'Discussion',
  DISCUSSION_ANSWER: 'Réponse (discussion)',
  DISCUSSION_ANSWER_REPLY: 'Réponse (sous-discussion)',
};

function ReportsTab({
  reports,
}: {
  reports: NonNullable<UserDetail['profile']>['reportsSubmitted'];
}) {
  if (reports.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucun signalement soumis.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Raison</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Statut</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {reports.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-secondary">
              <td className="max-w-xs px-4 py-3">
                <Link href={`/reports/${r.id}`} className="block">
                  <p className="text-sm font-medium text-primary hover:text-brand-primary hover:underline">
                    {REASON_LABELS[r.reason] || r.reason}
                  </p>
                  {r.message && (
                    <p className="mt-0.5 truncate text-xs text-tertiary">{r.message}</p>
                  )}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge color="gray" size="sm">
                  {RESOURCE_LABELS[r.resourceType] || r.resourceType}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge color={REPORT_STATUS_COLORS[r.status] || 'gray'} size="sm">
                  {REPORT_STATUS_LABELS[r.status] || r.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {formatDate(r.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsReceivedTab({
  reports,
}: {
  reports: NonNullable<UserDetail['profile']>['reportsReceived'];
}) {
  if (reports.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucun signalement reçu.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Signalé par</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Raison</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Statut</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {reports.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-secondary">
              <td className="whitespace-nowrap px-4 py-3">
                <Link href={`/users/${r.reporter.userId}`} className="flex items-center gap-2.5 group">
                  <Avatar
                    src={resolveAvatarUrl(r.reporter.avatarId)}
                    firstName={r.reporter.firstName}
                    lastName={r.reporter.lastName}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-primary group-hover:text-brand-primary group-hover:underline">
                    {r.reporter.firstName} {r.reporter.lastName}
                  </span>
                </Link>
              </td>
              <td className="max-w-xs px-4 py-3">
                <Link href={`/reports/${r.id}`} className="block">
                  <p className="text-sm font-medium text-primary hover:text-brand-primary hover:underline">
                    {REASON_LABELS[r.reason] || r.reason}
                  </p>
                  {r.message && (
                    <p className="mt-0.5 truncate text-xs text-tertiary">{r.message}</p>
                  )}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge color="gray" size="sm">
                  {RESOURCE_LABELS[r.resourceType] || r.resourceType}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge color={REPORT_STATUS_COLORS[r.status] || 'gray'} size="sm">
                  {REPORT_STATUS_LABELS[r.status] || r.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {formatDate(r.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Feedback ──────────────────────────────────────── */

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  BUG: 'Bug',
  SUGGESTION: 'Suggestion',
  COMMENT: 'Commentaire',
  FUNCTIONAL: 'Problème fonctionnel',
};

const FEEDBACK_TYPE_COLORS: Record<string, 'error' | 'brand' | 'success' | 'warning'> = {
  BUG: 'error',
  SUGGESTION: 'brand',
  COMMENT: 'success',
  FUNCTIONAL: 'warning',
};

function FeedbackTab({
  feedback,
}: {
  feedback: NonNullable<UserDetail['profile']>['feedbackSubmitted'];
}) {
  if (feedback.length === 0) {
    return <p className="py-8 text-center text-sm text-quaternary">Aucun feedback soumis.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Message</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Statut</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {feedback.map((f) => (
            <tr key={f.id} className="transition-colors hover:bg-secondary">
              <td className="max-w-sm px-4 py-3">
                <Link href={`/feedback/${f.id}`} className="block">
                  <p className="truncate text-sm text-primary hover:text-brand-primary hover:underline">{f.message}</p>
                  {f.url && (
                    <p className="mt-0.5 truncate text-xs text-tertiary">URL: {f.url}</p>
                  )}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge color={FEEDBACK_TYPE_COLORS[f.type] || 'gray'} size="sm">
                  {FEEDBACK_TYPE_LABELS[f.type] || f.type}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge color={REPORT_STATUS_COLORS[f.status] || 'gray'} size="sm">
                  {REPORT_STATUS_LABELS[f.status] || f.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                {formatDate(f.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
