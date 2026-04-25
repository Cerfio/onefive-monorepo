import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MessageCircle, Heart, Eye, Repeat2, Calendar } from 'lucide-react';
import { Card } from '@/components/base/card/card';
import Link from 'next/link';
import { PostAuthSwitch } from './PostAuthSwitch';
import { PostPrivateSection } from './PostPrivateSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

interface PostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarId?: string;
  highlight?: string;
}

interface PostSeoData {
  id: string;
  content: string | null;
  medias: any[];
  tags: string[];
  author: PostAuthor;
  stats: { comments: number; reactions: number; views: number; reposts: number };
  createdAt: string;
  updatedAt: string;
}

async function fetchPost(id: string): Promise<PostSeoData | null> {
  try {
    const response = await fetch(`${API_URL}/seo/post/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 1800 },
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (!result.success || !result.data) return null;
    return result.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPost(id);

  if (!post) {
    return { title: 'Post non trouvé' };
  }

  const authorName = [post.author.firstName, post.author.lastName]
    .filter(Boolean)
    .join(' ');

  const contentPreview = post.content
    ? post.content.slice(0, 140).replace(/\n/g, ' ')
    : 'Publication sur Onefive';

  const pageTitle = authorName;
  const fullTitle = `${authorName} sur Onefive`;
  const description = contentPreview;

  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'article',
      url: `${baseUrl}/post/${id}`,
      siteName: 'Onefive',
      images: [
        {
          url: `${baseUrl}/api/og/post/${id}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${baseUrl}/api/og/post/${id}`],
    },
  };
}

function buildJsonLd(post: PostSeoData, baseUrl: string) {
  const authorName = [post.author.firstName, post.author.lastName]
    .filter(Boolean)
    .join(' ');

  return {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    articleBody: post.content || '',
    author: {
      '@type': 'Person',
      name: authorName || 'Anonyme',
      url: `${baseUrl}/profile/${post.author.id}`,
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.stats.comments,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.stats.reactions,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ShareAction',
        userInteractionCount: post.stats.reposts,
      },
    ],
    url: `${baseUrl}/post/${post.id}`,
  };
}

export const revalidate = 1800;

export default async function PostPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';
  const jsonLd = buildJsonLd(post, baseUrl);
  const apiUrl = API_URL;

  const authorName = [post.author.firstName, post.author.lastName]
    .filter(Boolean)
    .join(' ');

  const formattedDate = new Date(post.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const avatarUrl = post.author.avatarId
    ? `${apiUrl}/file/${post.author.avatarId}`
    : null;

  return (
    <PostAuthSwitch postId={id}>
      <div className="min-h-screen bg-[#FCFCFD]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#475467] hover:text-violet-600 transition-colors"
          >
            Onefive
          </Link>

          <Card className="overflow-hidden bg-card rounded-xl border shadow-sm">
            <div className="p-6">
              {/* Author */}
              <div className="flex items-center gap-3">
                <Link href={`/profile/${post.author.id}`}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={authorName}
                      className="h-11 w-11 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
                      <span className="text-sm font-bold text-white">
                        {authorName.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </Link>
                <div className="flex flex-col">
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="font-semibold text-[#101828] hover:text-violet-600 transition-colors"
                  >
                    {authorName || 'Anonyme'}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-[#475467]">
                    {post.author.highlight && (
                      <span>{post.author.highlight}</span>
                    )}
                    {post.author.highlight && <span>·</span>}
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              {post.content && (
                <p className="mt-4 text-[15px] text-[#344054] whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-violet-50 text-violet-700 border border-violet-200 rounded-md px-2 py-0.5 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="mt-5 flex items-center gap-5 border-t border-gray-100 pt-4 text-sm text-[#475467]">
                <div className="flex items-center gap-1.5">
                  <Heart size={16} />
                  <span className="font-semibold text-[#101828]">{post.stats.reactions}</span>
                  <span>réactions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={16} />
                  <span className="font-semibold text-[#101828]">{post.stats.comments}</span>
                  <span>commentaires</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Repeat2 size={16} />
                  <span className="font-semibold text-[#101828]">{post.stats.reposts}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Eye size={16} />
                  <span>{post.stats.views}</span>
                </div>
              </div>
            </div>
          </Card>

          <PostPrivateSection postId={id} />
        </div>
      </div>
    </PostAuthSwitch>
  );
}
