'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditPost } from '../hooks/mutations';
import { useMe } from '@/hooks/useUser';
import { SubmitHandler, useForm } from 'react-hook-form';
import { editPostSchema, EditPostFormValues } from '../post.api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tags } from '@/enums';
import { tags as tagList } from '@/constant';
import { TextArea } from '@/components/base/textarea/textarea';
import { getFileCategory } from '../utils';
import Image from 'next/image';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ImageIcon, Plus, X } from 'lucide-react';
import { PostType } from '../post.api';

interface EditPostProps {
  post: PostType;
  onCancel: () => void;
  onSave?: () => void;
}

export const EditPost: React.FC<EditPostProps> = ({ post, onCancel, onSave }) => {
  const { data: user, isLoading } = useMe();
  const { mutateAsync: editPost, isLoading: isEditingPost } = useEditPost();

  // Get the real post ID (resolve tempId if needed)
  const realPostId = post?.id && !post.id.startsWith('temp-post-') ? post.id : null;

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditPostFormValues>({
    resolver: zodResolver(editPostSchema as any),
    mode: 'onChange',
    defaultValues: {
      content: post.content,
      tags: post.tags,
      medias: [],
    },
  });

  // Plus besoin de isInputFocused car les tags sont toujours visibles en mode édition
  const [selectedTags, setSelectedTags] = useState<Tags[]>(post.tags);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentValue = watch('content');

  const hasContent = contentValue && contentValue.trim().length > 0;
  const isSubmitDisabled = isEditingPost || !hasContent;

  // Sync selectedTags with form
  useEffect(() => {
    setValue('tags', selectedTags);
  }, [selectedTags, setValue]);

  // Initialize with existing content and tags
  useEffect(() => {
    setSelectedTags(post.tags);
    // Force the content value to be set in the form
    setValue('content', post.content);
  }, [post.tags, post.content, setValue]);

  const onSubmit: SubmitHandler<EditPostFormValues> = useCallback(
    async (data) => {
      try {
        setError(null);
        if (!realPostId) {
          setError('Post ID not available');
          return;
        }
        await editPost({
          postId: realPostId,
          content: data.content,
          tags: data.tags,
        });
        onSave?.();
      } catch (err) {
        setError('Failed to update post');
        console.error('Edit post error:', err);
      }
    },
    [editPost, realPostId, onSave],
  );

  const toggleTag = useCallback((tag: Tags) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const validFiles = files.filter((file) => {
        const category = getFileCategory(file.type);
        return category !== null;
      });

      if (validFiles.length !== files.length) {
        setError('Some files are not supported');
      }

      setValue('medias', validFiles);
      setPreviews(validFiles.map((file) => URL.createObjectURL(file)));
    },
    [setValue],
  );

  const removeFile = useCallback(
    (index: number) => {
      const currentFiles = watch('medias') || [];
      const newFiles = currentFiles.filter((_, i) => i !== index);
      setValue('medias', newFiles);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [watch, setValue],
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Avatar
            size="md"
            src={user?.avatar}
            alt={`${user?.firstName} ${user?.lastName}`}
            firstName={user?.firstName}
            lastName={user?.lastName}
          />
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <TextArea
              {...register('content')}
              placeholder="Modifiez votre publication..."
              className="min-h-[40px] bg-gray-50 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}

            {/* Media Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover w-full h-32"
                    />
                    <Button
                      type="button"
                      size="sm"
                      color="secondary"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeFile(index)}
                      iconLeading={<X data-icon />}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            <div className="border-t pt-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Tags sélectionnés:</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.length > 0 ? selectedTags.map((tag, tagIndex) => {
                  const tagInfo = tagList.find((t) => t.enum === tag);
                  return (
                    <button
                      key={`tag-${tag}-${tagIndex}`}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="cursor-pointer"
                    >
                      <Badge
                        type="pill-color"
                        color="brand"
                        size="sm"
                        className="hover:opacity-80 transition-opacity"
                      >
                        {tagInfo?.title || tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    </button>
                  );
                }) : (
                  <div className="text-sm text-gray-500 italic">Aucun tag sélectionné</div>
                )}
              </div>

              <div className="text-sm font-medium text-gray-700 mb-2">Tags disponibles:</div>
              <div className="flex flex-wrap gap-2">
                {tagList
                  .filter((tag) => !selectedTags.includes(tag.enum))
                  .map((tag) => (
                    <button
                      key={tag.enum}
                      type="button"
                      onClick={() => toggleTag(tag.enum as Tags)}
                      className="cursor-pointer"
                    >
                      <Badge
                        type="pill-color"
                        color="gray"
                        size="sm"
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {tag.title}
                      </Badge>
                    </button>
                  ))}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  color="tertiary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500"
                  iconLeading={<ImageIcon data-icon />}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  color="tertiary"
                  size="sm"
                  onClick={onCancel}
                  isDisabled={isEditingPost}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isDisabled={isSubmitDisabled}
                >
                  {isEditingPost ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
