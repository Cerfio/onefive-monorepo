'use client';

import { useMemo } from 'react';
import { useMe } from '@/hooks/useUser';

/**
 * Filigrane dynamique (nom + heure) répété en diagonale, posé en overlay sur
 * un viewer de data room. `pointer-events-none` pour ne pas gêner la lecture.
 * Dissuasif contre captures/fuites — côté client. Overlay utilisé pour les
 * PDF téléchargeables et les autres types de fichiers. Pour les PDF view-only
 * (sans droit de téléchargement), le vrai anti-fuite passe par le rendu serveur
 * rasterisé avec filigrane baké (cf. ServerRenderedPDFViewer / endpoint render).
 * Le conteneur parent doit être `relative`.
 */
export const DataroomWatermark = () => {
  const { data: me } = useMe();
  const label = useMemo(() => {
    const name = me ? `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim() : '';
    const email = (me as any)?.email ? ` · ${(me as any).email}` : '';
    const when = new Date().toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    return `${name || 'OneFive'}${email} · ${when}`;
  }, [me]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-wrap content-start overflow-hidden opacity-[0.08]">
      {Array.from({ length: 80 }).map((_, i) => (
        <span
          key={i}
          className="m-6 -rotate-[30deg] whitespace-nowrap text-sm font-semibold text-gray-900 select-none"
        >
          {label}
        </span>
      ))}
    </div>
  );
};
