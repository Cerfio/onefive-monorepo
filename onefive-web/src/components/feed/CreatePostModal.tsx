'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useCreatePost } from '@/features/post/hooks/mutations';
import { useMe } from '@/hooks/useUser';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createPostSchema, CreatePostType } from '@/features/post/post.api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tags } from '@/enums';
import { getFileCategory } from '@/features/post/utils';
import Image from 'next/image';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { TextArea } from '@/components/base/textarea/textarea';
import { FileText, ImageIcon, X } from 'lucide-react';
import { TagSelector } from '@/components/feed/TagSelector';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { IconNotification } from '@/components/application/notifications/notifications';
import { Check, Stars02, Edit05, Send01 } from '@untitledui/icons';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

const Confetti = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 99999 }}>
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: '-20px',
            width: `${Math.random() * 10 + 6}px`,
            height: `${Math.random() * 10 + 6}px`,
          }}
          initial={{
            y: -20,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            y: '110vh',
            rotate: 360,
            scale: 1,
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            ease: 'easeOut',
            delay: Math.random() * 1,
          }}
        />
      ))}
    </div>
  );
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onOpenChange,
  onPostCreated,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: user, isLoading } = useMe();
  const { mutateAsync: createPostMutation, isLoading: isCreatingPost } = useCreatePost();

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePostType>({
    resolver: zodResolver(createPostSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
      tags: [],
      medias: [],
    },
  });

  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [hasInteractedWithTags, setHasInteractedWithTags] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentValue = watch('content');
  const tagsValid = selectedTags.length >= 1 && selectedTags.length <= VALIDATION_LIMITS.POST.TAGS_MAX_COUNT;
  const hasContent = contentValue && contentValue.trim().length > 0;
  const hasMedia = mediaFiles.length > 0;
  const canPost = tagsValid && (hasContent || hasMedia) && !isCreatingPost;

  const resetForm = useCallback(() => {
    reset();
    setSelectedTags([]);
    setMediaFiles([]);
    setPreviews([]);
    setHasAttemptedSubmit(false);
    setHasInteractedWithTags(false);
    setShowSuccess(false);
    setShowConfetti(false);
  }, [reset]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 500);
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (mediaFiles.length > 0) {
      const objectUrls = mediaFiles.map((file) => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return null;
      });
      setPreviews(objectUrls.filter((url) => url !== null) as string[]);

      return () => {
        objectUrls.forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      };
    } else {
      setPreviews([]);
    }
  }, [mediaFiles]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = event.target.files;
      if (!newFiles || newFiles.length === 0) return;

      const currentFiles = mediaFiles || [];
      const updatedFiles = [...currentFiles, ...Array.from(newFiles)];

      const categories = updatedFiles.map((file) => getFileCategory(file.type));
      const firstCategory = categories[0];
      const isMixed = categories.some((category) => category !== firstCategory);

      if (isMixed) {
        return;
      }

      setMediaFiles(updatedFiles);
      setValue('medias', updatedFiles);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [mediaFiles, setValue],
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const updatedFiles = mediaFiles.filter((_, i) => i !== index);
      setMediaFiles(updatedFiles);
      setValue('medias', updatedFiles);
    },
    [mediaFiles, setValue],
  );

  const handleTagsChange = useCallback(
    (tags: Tags[]) => {
      setSelectedTags(tags);
      setValue('tags', tags);
      setHasInteractedWithTags(true);
    },
    [setValue],
  );

  const onSubmit: SubmitHandler<CreatePostType> = async (data) => {
    setHasAttemptedSubmit(true);

    const hasContent = data.content && data.content.trim().length > 0;
    const hasMedia = data.medias && data.medias.length > 0;

    if (!hasContent && !hasMedia) {
      return;
    }

    if (!tagsValid) {
      return;
    }

    if (!hasContent && hasMedia) {
      data.content = '';
    }

    try {
      await createPostMutation({
        ...data,
      });
      setShowSuccess(true);
      setShowConfetti(true);

      setTimeout(() => {
        onOpenChange(false);
        onPostCreated?.();
        toast.custom((t) => (
          <IconNotification
            title="Post publié avec succès !"
            description="Ton post est maintenant visible dans le fil. Continue comme ça !"
            color="success"
            confirmLabel="Parfait"
            onClose={() => toast.dismiss(t)}
            onConfirm={() => toast.dismiss(t)}
          />
        ));
      }, 2000);

      setTimeout(() => {
        setShowConfetti(false);
      }, 6000);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (!isMounted) {
    return null;
  }

  const showTagErrors = hasAttemptedSubmit || hasInteractedWithTags;
  const charCount = contentValue?.length ?? 0;
  const charLimit = VALIDATION_LIMITS.POST.CONTENT_MAX;
  const showCharCount = charCount > charLimit * 0.7;
  const publishBlockedByMissingTag = !tagsValid && selectedTags.length === 0;

  return (
    <>
      {showConfetti && <Confetti />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-visible rounded-2xl p-0">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="post-success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12 px-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-4"
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bravo, post publié !
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Ton post est maintenant visible dans ton fil. Continue de partager tes idées !
                  </p>

                  <div className="flex justify-center gap-2">
                    <Stars02 className="h-5 w-5 text-yellow-500" />
                    <Stars02 className="h-4 w-4 text-blue-500" />
                    <Stars02 className="h-6 w-6 text-purple-500" />
                    <Stars02 className="h-4 w-4 text-green-500" />
                    <Stars02 className="h-5 w-5 text-red-500" />
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="post-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                  <Edit05 className="h-5 w-5 text-[#5E6AD2]" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Créer un post</h2>
                    <p className="text-sm text-gray-500">Partage avec la communauté</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                  {/* Author + Content */}
                  <div className="px-6 pb-4">
                    <div className="flex items-start gap-3">
                      {isLoading && (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" />
                      )}
                      {user && (
                        <Avatar
                          size="md"
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          className="flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        {user && (
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {user.firstName} {user.lastName}
                          </p>
                        )}
                        <TextArea
                          {...register('content')}
                          disabled={isCreatingPost}
                          placeholder="Partage une idée, un apprentissage ou une avancée..."
                          maxLength={charLimit}
                          className="min-h-[120px] text-sm border-0 shadow-none focus:ring-0 p-0 resize-none"
                        />
                      </div>
                    </div>

                    {/* Char counter */}
                    <div className="flex justify-end mt-1">
                      {errors.content && (
                        <p className="text-red-500 text-xs mr-auto">{errors.content.message}</p>
                      )}
                      {showCharCount && (
                        <p className={`text-xs tabular-nums ${charCount >= charLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {charCount}/{charLimit}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Media previews */}
                  {mediaFiles.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="flex gap-2 flex-wrap">
                        {mediaFiles.map((file, index) => {
                          const fileCategory = getFileCategory(file.type);
                          const preview = previews[index];
                          return (
                            <div key={`${file.name}-${index}`} className="relative group">
                              {fileCategory === 'image' && preview ? (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                  <Image
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="relative w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                  <span className="text-[10px] text-gray-400 truncate max-w-[72px] px-1">{file.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Tags */}
                  <div className="px-6 py-4">
                    <TagSelector
                      selectedTags={selectedTags}
                      onTagsChange={handleTagsChange}
                      maxTags={VALIDATION_LIMITS.POST.TAGS_MAX_COUNT}
                      showErrors={showTagErrors}
                      excludeTags={[Tags.BUILD_IN_PUBLIC]}
                    />
                    {errors.tags && (
                      <p className="text-red-500 text-xs mt-1">{errors.tags.message as string}</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Actions footer */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        multiple
                      />
                      <Button
                        type="button"
                        color="tertiary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCreatingPost}
                        iconLeading={<ImageIcon className="h-4 w-4" />}
                      >
                        Médias
                      </Button>

                      {!tagsValid && selectedTags.length === 0 && (
                        <span className="text-xs text-amber-600">Ajoute 1 tag minimum</span>
                      )}
                      {showTagErrors && !tagsValid && selectedTags.length > 0 && (
                        <span className="text-xs text-red-500">
                          Maximum {VALIDATION_LIMITS.POST.TAGS_MAX_COUNT} tags
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        color="secondary"
                        size="md"
                        onClick={() => onOpenChange(false)}
                        isDisabled={isCreatingPost}
                      >
                        Annuler
                      </Button>
                      <div className="relative group">
                        <Button
                          type="submit"
                          color="primary"
                          size="md"
                          isDisabled={!canPost}
                          isLoading={isCreatingPost}
                          iconLeading={<Send01 data-icon />}
                          title={publishBlockedByMissingTag ? 'Ajoute au moins 1 tag pour publier' : undefined}
                        >
                          Publier
                        </Button>
                        {publishBlockedByMissingTag && (
                          <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden w-max max-w-[220px] rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                            Ajoute au moins 1 tag pour publier
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};
