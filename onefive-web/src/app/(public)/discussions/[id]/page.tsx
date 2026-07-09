import { permanentRedirect } from 'next/navigation';

/**
 * Route dédupliquée : `/discussions/[id]` (pluriel) n'est plus une page
 * distincte. L'URL canonique d'une discussion est `/discussion/[id]`
 * (singulier). On redirige en 308 permanent — un seul contenu servi, plus de
 * doublon SEO. Le composant `DiscussionAuthSwitch` de ce dossier reste utilisé
 * par la page canonique.
 */
export default async function DiscussionsDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`/discussion/${id}`);
}
