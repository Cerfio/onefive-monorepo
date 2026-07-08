'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { redeemShareLink } from '@/queries/dataroom';
import { Button } from '@/components/base/buttons/button';

/**
 * Page de rédemption d'un lien de partage sécurisé de data room.
 * L'utilisateur (authentifié — la route est sous (protected)) échange le token
 * contre un accès (ajout au groupe cible), puis est redirigé vers la data room.
 */
export default function DataroomShareRedeemPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('Validation de votre accès…');

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    (async () => {
      try {
        const { dataroomId } = await redeemShareLink(token);
        if (cancelled) return;
        router.replace(`/dataroom/${dataroomId}`);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? await (err as any).response
                ?.json?.()
                .then((b: any) => b?.error?.message || b?.message)
                .catch(() => null)
            : null;
        setMessage(msg || "Ce lien de partage est invalide, révoqué ou expiré.");
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      {status === 'loading' ? (
        <>
          <ShieldCheck className="mb-4 h-10 w-10 text-[#5E6AD2]" />
          <Loader2 className="mb-4 h-6 w-6 animate-spin text-gray-400" />
          <p className="text-sm text-gray-600">{message}</p>
        </>
      ) : (
        <>
          <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
          <h1 className="mb-2 text-lg font-semibold text-gray-900">Accès impossible</h1>
          <p className="mb-6 max-w-sm text-sm text-gray-600">{message}</p>
          <Button color="secondary" onClick={() => router.push('/dataroom')}>
            Voir mes data rooms
          </Button>
        </>
      )}
    </div>
  );
}
