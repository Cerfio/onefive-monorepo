'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { SearchLg } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Input } from '@/components/base/input/input';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { NativeSelect } from '@/components/base/select/select-native';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';

type Role = {
  id: string;
  key: string;
  name: string;
};

type AdminUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  roles: Array<{
    role: Role;
  }>;
};

type Invitation = {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  role: { key: string; name: string };
};

export default function AdminsPage() {
  const confirm = useConfirm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleKey, setInviteRoleKey] = useState('MODERATOR');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, adminsRes, invitationsRes] = await Promise.all([
        api.get('admin/roles').json<{ data: Role[] }>(),
        api
          .get('admin/admin-users', { searchParams: { skip: '0', take: '50' } })
          .json<{ data: AdminUser[] }>(),
        api
          .get('admin/invitations', { searchParams: { skip: '0', take: '50' } })
          .json<{ data: Invitation[] }>(),
      ]);

      setRoles(rolesRes.data ?? []);
      setAdmins(adminsRes.data ?? []);
      setInvitations(invitationsRes.data ?? []);
      if (!inviteRoleKey && rolesRes.data?.length) {
        setInviteRoleKey(rolesRes.data[0].key);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const roleOptions = useMemo(
    () => roles.map((r) => ({ value: r.key, label: `${r.name} (${r.key})` })),
    [roles],
  );

  const invite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await api.post('admin/auth/invitations', {
        json: { email: inviteEmail.trim(), roleKey: inviteRoleKey },
      });
      toast.success(`Invitation envoyée à ${inviteEmail.trim()}`);
      setInviteEmail('');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'invitation");
    }
  };

  const updateRole = async (adminUserId: string, roleKey: string) => {
    try {
      await api.patch(`admin/admin-users/${adminUserId}/role`, { json: { roleKey } });
      toast.success('Rôle mis à jour');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du changement de rôle');
    }
  };

  const toggleSuperAdmin = async (adminUserId: string, isSuperAdmin: boolean) => {
    try {
      await api.patch(`admin/admin-users/${adminUserId}/superadmin`, {
        json: { isSuperAdmin: !isSuperAdmin },
      });
      toast.success(isSuperAdmin ? 'Superadmin retiré' : 'Promu superadmin');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const toggleActive = async (adminUserId: string, isActive: boolean) => {
    try {
      await api.patch(`admin/admin-users/${adminUserId}/status`, {
        json: { isActive: !isActive },
      });
      toast.success(isActive ? 'Admin désactivé' : 'Admin réactivé');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    const ok = await confirm({
      title: 'Révoquer cette invitation ?',
      description: "L'invité ne pourra plus utiliser ce lien pour s'inscrire.",
      confirmLabel: 'Révoquer',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/invitations/${invitationId}/revoke`);
      toast.success('Invitation révoquée');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la révocation');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader.Root>
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Admins</SectionHeader.Heading>
            <SectionHeader.Subheading>Gestion des admins, rôles, superadmins et invitations.</SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" onClick={load}>Rafraîchir</Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>
      {loading && <TableSkeleton columns={4} rows={4} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && (
        <>
          <section className="rounded-xl border border-secondary bg-primary p-4 shadow-xs ring-1 ring-secondary">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
              Inviter un admin
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[260px]">
                <Input
                  type="email"
                  placeholder="email@onefive.app"
                  value={inviteEmail}
                  onChange={setInviteEmail}
                />
              </div>
              <div className="min-w-[200px]">
                <NativeSelect
                  options={roleOptions}
                  value={inviteRoleKey}
                  onChange={(e) => setInviteRoleKey(e.target.value)}
                />
              </div>
              <Button color="primary" onClick={invite}>Inviter</Button>
            </div>
          </section>

          {admins.length === 0 ? (
            <EmptyState>
              <EmptyState.Header>
                <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
              </EmptyState.Header>
              <EmptyState.Content>
                <EmptyState.Title>Aucun admin</EmptyState.Title>
                <EmptyState.Description>Invitez votre premier administrateur.</EmptyState.Description>
              </EmptyState.Content>
            </EmptyState>
          ) : (
            <section className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
              <table className="min-w-full divide-y divide-border-secondary">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {admins.map((admin) => {
                    const currentRole = admin.roles[0]?.role?.key ?? 'MODERATOR';
                    return (
                      <tr key={admin.id}>
                        <td className="px-4 py-3 text-sm text-primary">
                          <div>
                            {`${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || 'N/A'}
                          </div>
                          <div className="text-xs text-quaternary">{admin.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-tertiary">
                          <NativeSelect
                            options={roleOptions}
                            value={currentRole}
                            onChange={(e) => updateRole(admin.id, e.target.value)}
                            className="min-w-[140px]"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col gap-1">
                            {admin.isSuperAdmin && (
                              <Badge color="brand" size="sm" className="mb-1">Superadmin</Badge>
                            )}
                            {admin.isActive ? (
                              <Badge color="success" size="sm">Actif</Badge>
                            ) : (
                              <Badge color="error" size="sm">Désactivé</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <Button
                              color="secondary"
                              onClick={() => toggleSuperAdmin(admin.id, admin.isSuperAdmin)}
                            >
                              {admin.isSuperAdmin ? 'Retirer superadmin' : 'Promouvoir'}
                            </Button>
                            <Button
                              color={admin.isActive ? 'primary-destructive' : 'secondary'}
                              onClick={() => toggleActive(admin.id, admin.isActive)}
                            >
                              {admin.isActive ? 'Désactiver' : 'Réactiver'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          <section className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <div className="border-b border-secondary bg-secondary px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-tertiary">
                Invitations
              </h2>
            </div>
            {invitations.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-quaternary">
                Aucune invitation envoyée.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-border-secondary">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td className="px-4 py-3 text-sm text-primary">{invitation.email}</td>
                      <td className="px-4 py-3 text-sm text-tertiary">
                        {invitation.role.name} ({invitation.role.key})
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {invitation.status === 'PENDING' ? (
                          <Badge color="warning" size="sm">{invitation.status}</Badge>
                        ) : invitation.status === 'ACCEPTED' ? (
                          <Badge color="success" size="sm">{invitation.status}</Badge>
                        ) : (
                          <Badge color="gray" size="sm">{invitation.status}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {invitation.status === 'PENDING' ? (
                          <Button
                            color="primary-destructive"
                            onClick={() => revokeInvitation(invitation.id)}
                          >
                            Révoquer
                          </Button>
                        ) : (
                          <span className="text-xs text-quaternary">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
