'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link01, Copy01, Trash01, X } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import {
  listShareLinks,
  createShareLink,
  revokeShareLink,
} from '@/queries/dataroom';

interface ShareLinksModalProps {
  open: boolean;
  onClose: () => void;
  dataroomId: string;
  groups: { id: string; name: string }[];
}

/**
 * Gestion des liens de partage sécurisés d'une data room : création (groupe
 * cible + expiration + email-gate), copie, révocation. Le destinataire ouvre
 * le lien, est validé, puis ajouté au groupe choisi.
 */
export const ShareLinksModal = ({ open, onClose, dataroomId, groups }: ShareLinksModalProps) => {
  const queryClient = useQueryClient();
  const [groupId, setGroupId] = useState('');
  const [requireEmail, setRequireEmail] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState('30');

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['dataroom-share-links', dataroomId],
    queryFn: () => listShareLinks(dataroomId),
    enabled: open,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createShareLink({
        dataroomId,
        groupId: groupId || groups[0]?.id,
        requireEmail,
        expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      }),
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: ['dataroom-share-links', dataroomId] });
      const url = `${window.location.origin}/dataroom/share/${link.token}`;
      navigator.clipboard?.writeText(url).catch(() => {});
      toast.success('Lien créé et copié dans le presse-papier');
    },
    onError: () => toast.error('Erreur lors de la création du lien'),
  });

  const revokeMut = useMutation({
    mutationFn: (linkId: string) => revokeShareLink({ dataroomId, linkId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataroom-share-links', dataroomId] });
      toast.success('Lien révoqué');
    },
    onError: () => toast.error('Erreur lors de la révocation'),
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/dataroom/share/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast.success('Lien copié');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Link01 className="h-5 w-5 text-[#5E6AD2]" />
            <h3 className="text-md font-semibold text-gray-900">Liens de partage</h3>
          </div>
          <Button iconLeading={X} color="tertiary" size="sm" onClick={onClose} aria-label="Fermer" />
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Création */}
          <div className="mb-5 space-y-3 rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900">Nouveau lien</p>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Groupe (permissions)</label>
              <select
                value={groupId || groups[0]?.id || ''}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={requireEmail} onChange={(e) => setRequireEmail(e.target.checked)} />
                Exiger un email
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Expire dans
                <input
                  type="number"
                  min={1}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                />
                jours
              </label>
            </div>
            <Button
              size="sm"
              onClick={() => createMut.mutate()}
              isDisabled={createMut.isPending || groups.length === 0}
            >
              {createMut.isPending ? 'Création…' : 'Créer le lien'}
            </Button>
            {groups.length === 0 && (
              <p className="text-xs text-amber-600">Créez d&apos;abord un groupe pour définir les permissions.</p>
            )}
          </div>

          {/* Liste */}
          {isLoading ? (
            <p className="text-sm text-gray-400">Chargement…</p>
          ) : links.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun lien actif.</p>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{link.group?.name ?? 'Groupe'}</p>
                    <p className="text-xs text-gray-500">
                      {link.redeemCount} accès
                      {link.expiresAt ? ` · expire le ${new Date(link.expiresAt).toLocaleDateString('fr-FR')}` : ' · sans expiration'}
                      {link.requireEmail ? ' · email requis' : ''}
                    </p>
                  </div>
                  <Button iconLeading={Copy01} color="tertiary" size="sm" onClick={() => copyLink(link.token)} aria-label="Copier" />
                  <Button
                    iconLeading={Trash01}
                    color="tertiary"
                    size="sm"
                    onClick={() => revokeMut.mutate(link.id)}
                    isDisabled={revokeMut.isPending}
                    aria-label="Révoquer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
