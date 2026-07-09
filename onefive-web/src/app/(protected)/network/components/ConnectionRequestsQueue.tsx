'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import {
  useAcceptConnectionRequest,
  useRejectConnectionRequest,
} from '@/hooks/useConnection';

interface PendingRequest {
  requesterId: string;
  message?: string | null;
  requester?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarId?: string | null;
    highlight?: string | null;
  };
}

/**
 * File des demandes de connexion reçues, avec le contexte du demandeur (rôle/
 * accroche) et accept / refus en un clic.
 */
export const ConnectionRequestsQueue = () => {
  const { data: pending = [] } = useQuery({
    queryKey: ['pending-connections'],
    queryFn: async () => {
      const res = await api.get('profiles/connections/pending');
      const json = (await res.json()) as { data: PendingRequest[] };
      return json.data;
    },
    staleTime: 1000 * 60,
  });

  const accept = useAcceptConnectionRequest();
  const reject = useRejectConnectionRequest();

  if (!pending || pending.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#101828]">
        Demandes de connexion ({pending.length})
      </h3>
      <div className="space-y-2">
        {pending.map((req) => {
          const p = req.requester;
          const id = p?.id ?? req.requesterId;
          const name = p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : 'Membre';
          return (
            <div key={id} className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${id}`}>
                  <Avatar
                    src={p?.avatarId ? `${process.env.NEXT_PUBLIC_API_URL}/file/${p.avatarId}` : undefined}
                    alt={name}
                    firstName={p?.firstName}
                    lastName={p?.lastName}
                    size="sm"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/profile/${id}`} className="truncate text-sm font-medium text-[#101828] hover:underline">
                    {name}
                  </Link>
                  {p?.highlight && (
                    <p className="truncate text-xs text-gray-500">{p.highlight}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => accept.mutate(id)}
                  isDisabled={accept.isPending}
                >
                  Accepter
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => reject.mutate(id)}
                  isDisabled={reject.isPending}
                >
                  Ignorer
                </Button>
              </div>
              {req.message && (
                <p className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <span className="mr-1">💬</span>{req.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
