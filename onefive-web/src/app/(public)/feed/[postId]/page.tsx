import { permanentRedirect } from 'next/navigation';

/**
 * Route dédupliquée : `/feed/[postId]` n'est plus une page distincte. L'URL
 * canonique d'un post est `/post/[id]` (fiche plus riche + JSON-LD). On redirige
 * en 308 permanent — un seul contenu servi, plus de doublon SEO.
 */
export default async function FeedPostRedirect({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  permanentRedirect(`/post/${postId}`);
}
