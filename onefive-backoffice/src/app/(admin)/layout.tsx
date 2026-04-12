'use client';

import type { NavItemType } from '@/components/application/app-navigation/config';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeLine,
  Users01,
  ClockRewind,
  MessageChatCircle,
  Compass03,
  Building05,
  MessageQuestionCircle,
  LogOut01,
  FolderLock,
  Menu01,
  XClose,
  AlertTriangle,
  MessageSmileCircle,
} from '@untitledui/icons';
import { api } from '@/lib/api';
import { Button } from '@/components/base/buttons/button';
import { NavList } from '@/components/application/app-navigation/base-components/nav-list';
import { cx } from '@/utils/cx';
import { Input } from '@/components/base/input/input';
import { useAdminShortcuts } from '@/hooks/use-admin-shortcuts';
import { toast } from 'sonner';

type AdminMe = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

type DashboardStats = {
  waitlist: number;
  pendingReports: number;
  pendingFeedback: number;
};

function CountBadge({ count, color = 'warning' }: { count: number; color?: 'warning' | 'error' }) {
  if (count === 0) return null;
  const colors = {
    warning: 'bg-warning-secondary text-warning-primary',
    error: 'bg-error-secondary text-error-primary',
  };
  return (
    <span className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${colors[color]}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

const baseNavItems: NavItemType[] = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeLine },
  { href: '/users', label: 'Utilisateurs', icon: Users01 },
  { href: '/waitlist', label: 'Waitlist', icon: ClockRewind },
  { href: '/posts', label: 'Posts', icon: MessageChatCircle },
  { href: '/discussions', label: 'Discussions', icon: MessageQuestionCircle },
  { href: '/spotlight', label: 'Spotlight', icon: Compass03 },
  { href: '/startups', label: 'Startups', icon: Building05 },
  { href: '/reports', label: 'Signalements', icon: AlertTriangle },
  { href: '/feedback', label: 'Feedback', icon: MessageSmileCircle },
  { href: '/admins', label: 'Admins', icon: Users01 },
  { href: '/datarooms', label: 'Datarooms', icon: FolderLock },
  { href: '/audit-logs', label: 'Audit logs', icon: ClockRewind },
];

export default function AdminLayout({ children }: { children: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useAdminShortcuts();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('admin/auth/me').json<{ data: AdminMe }>();
        if (!mounted) return;
        setAdmin(res.data ?? null);
        setLoading(false);
      } catch {
        if (!mounted) return;
        setAuthError('Session admin invalide');
        router.replace('/login');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api
          .get('admin/dashboard')
          .json<{ data: DashboardStats }>();
        if (mounted) setStats(res.data ?? null);
      } catch {
        // silent
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = useMemo<NavItemType[]>(() => {
    return baseNavItems.map((item) => {
      if (item.href === '/waitlist' && stats?.waitlist) {
        return { ...item, badge: <CountBadge count={stats.waitlist} /> };
      }
      if (item.href === '/reports' && stats?.pendingReports) {
        return { ...item, badge: <CountBadge count={stats.pendingReports} color="error" /> };
      }
      if (item.href === '/feedback' && stats?.pendingFeedback) {
        return { ...item, badge: <CountBadge count={stats.pendingFeedback} /> };
      }
      return item;
    });
  }, [stats]);

  const onSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const body: Record<string, string> = {};
      if (profileForm.firstName) body.firstName = profileForm.firstName;
      if (profileForm.lastName) body.lastName = profileForm.lastName;
      if (profileForm.currentPassword && profileForm.newPassword) {
        body.currentPassword = profileForm.currentPassword;
        body.newPassword = profileForm.newPassword;
      }
      const res = await api
        .patch('admin/auth/me', { json: body })
        .json<{ data: AdminMe }>();
      setAdmin(res.data);
      setShowProfileEdit(false);
      setProfileForm({ firstName: '', lastName: '', currentPassword: '', newPassword: '' });
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setProfileSaving(false);
    }
  };

  const onLogout = async () => {
    await api.post('admin/auth/logout').catch(() => undefined);
    router.replace('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary_subtle">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-solid border-t-transparent" />
          <p className="text-sm text-tertiary">{authError ?? 'Vérification de session...'}</p>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="mb-6 px-2">
        <p className="text-xs font-medium uppercase tracking-wide text-tertiary">Onefive</p>
        <h2 className="text-lg font-semibold text-primary">Backoffice</h2>
      </div>

      <NavList key={pathname} activeUrl={pathname} items={navItems} className="flex-1" />

      <div className="mt-auto border-t border-secondary pt-4">
        {admin && (
          <button
            onClick={() => {
              setProfileForm({
                firstName: admin.firstName ?? '',
                lastName: admin.lastName ?? '',
                currentPassword: '',
                newPassword: '',
              });
              setShowProfileEdit(!showProfileEdit);
            }}
            className="mb-3 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-secondary"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-semibold text-brand-secondary_fg">
              {(admin.firstName?.[0] ?? admin.email[0]).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-primary">
                {admin.firstName && admin.lastName
                  ? `${admin.firstName} ${admin.lastName}`
                  : admin.email}
              </p>
              {admin.firstName && (
                <p className="truncate text-xs text-quaternary">{admin.email}</p>
              )}
            </div>
          </button>
        )}
        {showProfileEdit && (
          <div className="mb-3 space-y-2 rounded-lg border border-secondary bg-secondary_subtle p-3">
            <Input
              placeholder="Prénom"
              value={profileForm.firstName}
              onChange={(v) => setProfileForm((p) => ({ ...p, firstName: v }))}
            />
            <Input
              placeholder="Nom"
              value={profileForm.lastName}
              onChange={(v) => setProfileForm((p) => ({ ...p, lastName: v }))}
            />
            <Input
              placeholder="Mot de passe actuel"
              value={profileForm.currentPassword}
              onChange={(v) => setProfileForm((p) => ({ ...p, currentPassword: v }))}
              type="password"
            />
            <Input
              placeholder="Nouveau mot de passe"
              value={profileForm.newPassword}
              onChange={(v) => setProfileForm((p) => ({ ...p, newPassword: v }))}
              type="password"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                className="flex-1"
                onClick={onSaveProfile}
                isDisabled={profileSaving}
              >
                {profileSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                size="sm"
                color="secondary"
                onClick={() => setShowProfileEdit(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
        <Button
          color="secondary"
          size="sm"
          className="w-full justify-center"
          iconLeading={LogOut01}
          onClick={onLogout}
        >
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-secondary_subtle">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-secondary bg-primary px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-tertiary">Onefive</p>
          <h2 className="text-base font-semibold text-primary">Backoffice</h2>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-tertiary transition hover:bg-secondary"
        >
          {sidebarOpen ? <XClose className="h-5 w-5" /> : <Menu01 className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-overlay/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-primary p-4 pt-16 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px] gap-6 p-4 lg:p-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-72 shrink-0 flex-col rounded-2xl border border-secondary bg-primary p-4 shadow-xs lg:flex">
          {sidebarContent}
        </aside>

        <section
          className={cx(
            'min-w-0 flex-1 rounded-2xl bg-primary p-4 shadow-xs ring-1 ring-secondary lg:p-6',
          )}
        >
          {children}
        </section>
      </div>
    </div>
  );
}
