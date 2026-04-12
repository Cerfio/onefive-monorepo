'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  Users01,
  ClockRewind,
  MessageChatCircle,
  MessageQuestionCircle,
  Building05,
  Compass03,
  FolderLock,
  ArrowUpRight,
} from '@untitledui/icons';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { Badge } from '@/components/base/badges/badges';
import { cx } from '@/utils/cx';
import { DashboardCardsSkeleton, TableSkeleton } from '@/components/application/table/table-skeleton';

type DashboardStats = {
  users: number;
  waitlist: number;
  posts: number;
  discussions: number;
  startups: number;
  datarooms: number;
  spots: number;
};

type RecentActivity = {
  id: string;
  action: string;
  resourceType: string;
  createdAt: string;
  adminUser: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

const statCards: {
  key: keyof DashboardStats;
  label: string;
  icon: typeof Users01;
  href: string;
  color: 'gray' | 'brand' | 'success' | 'warning' | 'error';
}[] = [
  { key: 'users', label: 'Utilisateurs', icon: Users01, href: '/users', color: 'brand' },
  { key: 'waitlist', label: 'Waitlist', icon: ClockRewind, href: '/waitlist', color: 'warning' },
  { key: 'posts', label: 'Posts', icon: MessageChatCircle, href: '/posts', color: 'success' },
  { key: 'discussions', label: 'Discussions', icon: MessageQuestionCircle, href: '/discussions', color: 'brand' },
  { key: 'startups', label: 'Startups', icon: Building05, href: '/startups', color: 'brand' },
  { key: 'spots', label: 'Spotlight', icon: Compass03, href: '/spotlight', color: 'gray' },
  { key: 'datarooms', label: 'Datarooms', icon: FolderLock, href: '/datarooms', color: 'gray' },
];

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('admin/dashboard').json<{ data: DashboardStats }>();
        setStats(res.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await api
          .get('admin/audit-logs', { searchParams: { skip: '0', take: '8' } })
          .json<{ data: RecentActivity[] }>();
        setActivity(res.data ?? []);
      } catch {
        // silent
      } finally {
        setActivityLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader.Root className="border-none pb-0">
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Dashboard</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Vue d&apos;ensemble de la plateforme Onefive.
            </SectionHeader.Subheading>
          </div>
        </SectionHeader.Group>
      </SectionHeader.Root>

      {loading ? (
        <DashboardCardsSkeleton count={statCards.length} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = stats?.[card.key];
            return (
              <Link
                key={card.key}
                href={card.href}
                className={cx(
                  'group flex flex-col gap-4 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset transition hover:shadow-sm md:gap-5 md:px-5 md:py-5',
                )}
              >
                <div className="flex items-start justify-between">
                  <FeaturedIcon color={card.color} theme="modern" icon={Icon} size="lg" />
                  <ArrowUpRight className="h-4 w-4 text-quaternary opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-display-sm font-semibold text-primary">
                    {value?.toLocaleString('fr-FR') ?? '-'}
                  </p>
                  <p className="text-sm font-medium text-tertiary">{card.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Activité récente */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-primary">Activité récente</h3>
            <p className="mt-0.5 text-sm text-tertiary">
              Dernières actions admin sur la plateforme.
            </p>
          </div>
          <Link
            href="/audit-logs"
            className="text-sm font-semibold text-brand-primary transition hover:text-brand-primary_hover"
          >
            Voir tout
          </Link>
        </div>

        {activityLoading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : activity.length === 0 ? (
          <div className="rounded-xl border border-secondary bg-secondary_subtle p-8 text-center">
            <p className="text-sm text-tertiary">Aucune activité récente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                    Quand
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {activity.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-secondary">
                    <td className="px-4 py-3">
                      <Badge color={getActionColor(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-primary">
                      {log.adminUser
                        ? `${log.adminUser.firstName ?? ''} ${log.adminUser.lastName ?? ''}`.trim() ||
                          log.adminUser.email
                        : 'Système'}
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">{log.resourceType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-quaternary">
                      {timeAgo(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
