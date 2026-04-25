import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MessageCircle, ThumbsUp, Eye, Calendar } from 'lucide-react';
import { Card } from '@/components/base/card/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DiscussionAuthSwitch } from './DiscussionAuthSwitch';
import { DiscussionPrivateSection } from '@/app/(public)/discussion/[id]/DiscussionPrivateSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

interface DiscussionAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarId?: string;
}

interface DiscussionSeoData {
  id: string;
  question: string;
  content?: string;
  context?: string;
  tags?: string[];
  type: string;
  author: DiscussionAuthor;
  stats: { answers: number; upvotes: number; views: number };
  createdAt: string;
  updatedAt: string;
}

async function fetchDiscussion(id: string): Promise<DiscussionSeoData | null> {
  try {
    const response = await fetch(`${API_URL}/seo/discussion/${id}`, {
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
  const discussion = await fetchDiscussion(id);
  if (!discussion) return { title: 'Discussion non trouvée' };

  const pageTitle = discussion.question.length > 60
    ? `${discussion.question.slice(0, 60)}...`
    : discussion.question;
  const fullTitle = `${pageTitle} | Onefive`;
  const description = discussion.content?.slice(0, 160) || discussion.question.slice(0, 160) || 'Discussion sur Onefive';
  const baseUrl = process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://onefive.app';

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'article',
      url: `${baseUrl}/discussions/${id}`,
      siteName: 'Onefive',
      images: [{ url: `${baseUrl}/api/og/discussion/${id}`, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${baseUrl}/api/og/discussion/${id}`],
    },
  };
}

export const revalidate = 1800;

export default async function DiscussionsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discussion = await fetchDiscussion(id);
  if (!discussion) notFound();

  const authorName = [discussion.author.firstName, discussion.author.lastName].filter(Boolean).join(' ');
  const formattedDate = new Date(discussion.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const truncatedContent = discussion.content && discussion.content.length > 200
    ? `${discussion.content.slice(0, 200)}...`
    : discussion.content || '';

  return (
    <DiscussionAuthSwitch discussionId={id}>
      <div className="min-h-screen bg-[#FCFCFD]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[#475467] hover:text-violet-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Onefive
          </Link>

          <Card className="overflow-hidden bg-card rounded-xl border shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-[#101828]">{discussion.question}</h1>

              <div className="mt-4 flex items-center gap-4 text-sm text-[#475467]">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
                    <span className="text-xs font-bold text-white">{authorName.charAt(0) || '?'}</span>
                  </div>
                  <span className="font-medium text-[#101828]">{authorName || 'Anonyme'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {discussion.tags && discussion.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {discussion.tags.map((tag) => (
                    <span key={tag} className="bg-violet-50 text-violet-700 border border-violet-200 rounded-md px-2 py-0.5 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {truncatedContent && (
                <p className="mt-4 text-sm text-[#475467] whitespace-pre-wrap">{truncatedContent}</p>
              )}

              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-[#475467]" />
                  <span className="font-semibold text-[#101828]">{discussion.stats.answers}</span>
                  <span className="text-[#475467]">réponses</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp size={16} className="text-[#475467]" />
                  <span className="font-semibold text-[#101828]">{discussion.stats.upvotes}</span>
                  <span className="text-[#475467]">votes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#475467]" />
                  <span className="font-semibold text-[#101828]">{discussion.stats.views}</span>
                  <span className="text-[#475467]">vues</span>
                </div>
              </div>
            </div>
          </Card>

          <DiscussionPrivateSection discussionId={id} />
        </div>
      </div>
    </DiscussionAuthSwitch>
  );
}
