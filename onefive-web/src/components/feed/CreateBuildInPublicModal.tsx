'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/base/dialog/dialog';
import { useCreatePost } from '@/features/post/hooks/mutations';
import { useMe } from '@/hooks/useUser';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createPostSchema, CreatePostType } from '@/features/post/post.api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tags } from '@/enums';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { TextArea } from '@/components/base/textarea/textarea';
import { CreateBuildInPublicPost } from '@/components/feed/CreateBuildInPublicPost';
import { BuildInPublicData } from '@/components/feed/BuildInPublicPost';
import { encodeBuildInPublicData } from '@/utils/buildInPublic';
import { useUserStartups } from '@/queries/startup';
import { CreateStartupModal } from '@/features/startup/create/CreateStartupModal';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Rocket } from 'lucide-react';

interface CreateBuildInPublicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
  initialType?: 'update' | 'metrics' | 'launch';
}

const TYPE_CONFIG = {
  update: { label: 'Update', icon: Calendar },
  metrics: { label: 'Métriques', icon: TrendingUp },
  launch: { label: 'Launch', icon: Rocket },
};

export const CreateBuildInPublicModal: React.FC<CreateBuildInPublicModalProps> = ({
  open,
  onOpenChange,
  onPostCreated,
  initialType,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isCreateStartupModalOpen, setIsCreateStartupModalOpen] = useState(false);
  const [wasOpenBeforeStartupModal, setWasOpenBeforeStartupModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const { data: userStartups, isLoading: isLoadingStartups } = useUserStartups();
  const { mutateAsync: createPostMutation, isLoading: isCreatingPost } = useCreatePost();

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostType>({
    resolver: zodResolver(createPostSchema as any),
    mode: 'onChange',
    defaultValues: {
      content: '',
      tags: [Tags.BUILD_IN_PUBLIC],
      medias: [],
    },
  });

  const [buildInPublicData, setBuildInPublicData] = useState<BuildInPublicData | null>(
    initialType ? { type: initialType } : null
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const contentValue = watch('content');
  const hasContent = contentValue && contentValue.trim().length > 0;
  const buildInPublicValid = buildInPublicData?.type !== undefined && buildInPublicData?.projectId !== undefined;
  const canPost = buildInPublicValid && hasContent && !isCreatingPost;

  const currentType = buildInPublicData?.type || initialType;
  const typeConfig = currentType ? TYPE_CONFIG[currentType] : null;

  const resetForm = useCallback(() => {
    reset({
      content: '',
      tags: [Tags.BUILD_IN_PUBLIC],
      medias: [],
    });
    setBuildInPublicData(initialType ? { type: initialType } : null);
    setHasAttemptedSubmit(false);
  }, [reset, initialType]);

  const handleStartupModalClose = useCallback((isOpen: boolean) => {
    setIsCreateStartupModalOpen(isOpen);
    if (!isOpen) {
      queryClient.invalidateQueries({ queryKey: ['user-startups'] });
      setTimeout(() => {
        const refreshedStartups = queryClient.getQueryData(['user-startups']);
        if (refreshedStartups && Array.isArray(refreshedStartups) && refreshedStartups.length > 0 && wasOpenBeforeStartupModal) {
          onOpenChange(true);
        }
        setWasOpenBeforeStartupModal(false);
      }, 500);
    }
  }, [queryClient, onOpenChange, wasOpenBeforeStartupModal]);

  const onSubmit: SubmitHandler<CreatePostType> = async (data) => {
    setHasAttemptedSubmit(true);

    if (!buildInPublicValid || !hasContent) {
      return;
    }

    try {
      const finalContent = encodeBuildInPublicData(data.content || '', buildInPublicData!);

      await createPostMutation({
        ...data,
        content: finalContent,
        tags: [Tags.BUILD_IN_PUBLIC],
      });
      resetForm();
      onOpenChange(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating Build in Public post:', error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
      setWasOpenBeforeStartupModal(false);
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (open && !isLoadingStartups && userStartups && userStartups.length === 0) {
      setWasOpenBeforeStartupModal(true);
      setIsCreateStartupModalOpen(true);
      onOpenChange(false);
    }
  }, [open, isLoadingStartups, userStartups, onOpenChange]);

  useEffect(() => {
    if (!isCreateStartupModalOpen && !isLoadingStartups && userStartups && userStartups.length > 0 && !open && wasOpenBeforeStartupModal) {
      const timer = setTimeout(() => {
        onOpenChange(true);
        setWasOpenBeforeStartupModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCreateStartupModalOpen, isLoadingStartups, userStartups, open, onOpenChange, wasOpenBeforeStartupModal]);

  if (!isMounted) {
    return null;
  }

  const hasNoStartups = !isLoadingStartups && userStartups && userStartups.length === 0;

  return (
    <>
      {hasNoStartups && (
        <CreateStartupModal
          open={isCreateStartupModalOpen}
          onOpenChange={handleStartupModalClose}
        />
      )}
      {!hasNoStartups && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-xl p-0 overflow-hidden">
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Nouveau post
                </DialogTitle>
                {typeConfig && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    <typeConfig.icon className="w-3.5 h-3.5" />
                    {typeConfig.label}
                  </span>
                )}
              </div>
            </DialogHeader>

            {/* Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(85vh-140px)]">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* User + TextArea */}
                <div className="flex gap-3">
                  {isLoading ? (
                    <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0 animate-pulse" />
                  ) : user && (
                    <Avatar
                      size="md"
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      className="shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <TextArea
                      {...register('content')}
                      disabled={isCreatingPost}
                      placeholder="Partagez votre progression..."
                      className="min-h-[100px] text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-200 rounded-lg resize-none"
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
                    )}
                  </div>
                </div>

                {/* Build in Public Form */}
                <CreateBuildInPublicPost
                  onDataChange={setBuildInPublicData}
                  initialData={buildInPublicData || undefined}
                  initialType={initialType || buildInPublicData?.type}
                />
                
                {hasAttemptedSubmit && !buildInPublicValid && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm"
                  >
                    Sélectionnez un projet et un type de post
                  </motion.p>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {buildInPublicData?.projectName && (
                      <>Projet : <span className="font-medium text-gray-700">{buildInPublicData.projectName}</span></>
                    )}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      color="secondary"
                      size="sm"
                      onClick={() => onOpenChange(false)}
                      disabled={isCreatingPost}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      size="sm"
                      isDisabled={!canPost}
                      isLoading={isCreatingPost}
                    >
                      Publier
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
