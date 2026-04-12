'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import { Sort, Tags, DiscussionType } from '@/enums';
import { createDiscussion, fetchDiscussions } from '@/queries/discussion';
import posthog from 'posthog-js';
import Navbar from '@/components/navbar';
import { Spinner } from '@/components/base/spinner';
import {
  DiscussionCard,
  DiscussionShimmer,
  DiscussionHeader,
  DiscussionFilters,
  DiscussionSidebar,
  DiscussionTopicFilterMobile,
} from './components';
import { CreateDiscussionModal } from './modals/CreateDiscussionModal';
import { useDiscussionSearch } from './hooks/useDiscussionSearch';

const DISCUSSIONS_PAGE_SIZE = 10;

const DiscussionPage = () => {
  const [sort, setSort] = useState<Sort>(Sort.NEWEST);
  const [topic, setTopic] = useState<Tags | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { ref, inView } = useInView();

  const { search, debouncedSearch, isSearching, handleSearchChange } = useDiscussionSearch();

  const { data, isSuccess, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['discussions', sort, topic, debouncedSearch, DISCUSSIONS_PAGE_SIZE],
    async ({ pageParam = 0 }) => {
      return await fetchDiscussions({
        offset: pageParam,
        sort,
        search: debouncedSearch,
        tag: topic,
        limit: DISCUSSIONS_PAGE_SIZE,
      });
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < DISCUSSIONS_PAGE_SIZE) {
          return undefined;
        }
        return allPages.length * DISCUSSIONS_PAGE_SIZE;
      },
    },
  );

  const { mutateAsync: mutateCreateDiscussion, isLoading: isLoadingCreateDiscussion } = useMutation({
    mutationFn: (data: {
      question: string;
      content: string;
      options: string[];
      tags: string[];
      type: DiscussionType;
      saas: any;
    }) => {
      return createDiscussion(data);
    },
    onSuccess: data => {
      posthog.capture('discussion_created');
      router.push(`/discussions/${data.id}`);
    },
  });

  const handleCreateDiscussion = (data: {
    title: string;
    content: string;
    options: string[];
    chosenTags: string[];
    discussionType: DiscussionType;
    saas: any;
  }) => {
    mutateCreateDiscussion({
      question: data.title,
      content: data.content,
      options: data.options,
      tags: data.chosenTags,
      type: data.discussionType,
      saas: data.saas,
    });
  };

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const discussions = data?.pages.flat() || [];

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <DiscussionHeader topic={topic} onOpenCreateModal={() => setIsModalOpen(true)} />

        {/* Search and filters section */}
        <DiscussionFilters
          search={search}
          onSearchChange={handleSearchChange}
          sort={sort}
          onSortChange={setSort}
        />

        <DiscussionTopicFilterMobile topic={topic} onTopicChange={setTopic} />

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="space-y-6">
              {(isLoading || isSearching) && (
                <div className="space-y-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <DiscussionShimmer key={i} />
                  ))}
                </div>
              )}
              {isError && !isSearching && (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-[#101828]">Erreur</h2>
                  <p className="text-[#475467] mt-2">Impossible de charger les discussions.</p>
                </div>
              )}
              {isSuccess && discussions.length === 0 && !isSearching && (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                  <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold text-[#101828]">Aucune discussion trouvée</h2>
                  <p className="text-[#475467] mt-2">
                    Essayez de modifier vos filtres ou créez une nouvelle discussion.
                  </p>
                </div>
              )}
              {isSuccess && !isSearching && discussions.length > 0 && (
                <div>
                  {discussions.map((discussion, index) => {
                    if (index === discussions.length - 1) {
                      return (
                        <div key={discussion.id} ref={ref}>
                          <DiscussionCard discussion={discussion} />
                        </div>
                      );
                    }
                    return <DiscussionCard key={discussion.id} discussion={discussion} />;
                  })}
                </div>
              )}
            </div>
            {isFetchingNextPage && (
              <div className="mt-8 flex justify-center">
                <Spinner size="lg" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <DiscussionSidebar topic={topic} onTopicChange={setTopic} />
        </div>
      </div>

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateDiscussion}
        isLoading={isLoadingCreateDiscussion}
      />
    </div>
  );
};

export default DiscussionPage;
