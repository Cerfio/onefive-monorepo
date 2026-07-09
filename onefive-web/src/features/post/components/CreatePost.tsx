'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useCreatePost } from '../hooks/mutations';
import { useMe } from '@/hooks/useUser';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createPostSchema, CreatePostType } from '../post.api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tags } from '@/enums';
import { tags as tagList } from '@/constant';
import { getFileCategory } from '../utils';
import Image from 'next/image';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { TextArea } from '@/components/base/textarea/textarea';
import { FileText, ImageIcon, Plus, Video, X } from 'lucide-react';
import { CreateBuildInPublicPost } from '@/components/feed/CreateBuildInPublicPost';
import { BuildInPublicData } from '@/components/feed/BuildInPublicPost';
import { encodeBuildInPublicData } from '@/utils/buildInPublic';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileEdit } from 'lucide-react';
import {
  listDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  type PostDraft,
} from '@/queries/postDrafts';
import { useSearchProfiles } from '@/hooks/useSearchProfiles';
import { Avatar as MentionAvatar } from '@/components/base/avatar/avatar';

interface CreatePostProps {
  onSuccess?: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onSuccess }) => {
  const { data: user, isLoading } = useMe();
  const { mutateAsync: createPostMutation, isLoading: isCreatingPost } =
    useCreatePost();

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreatePostType>({
    resolver: zodResolver(createPostSchema as any),
    mode: 'onChange',
    defaultValues: {
      content: '',
      tags: [],
      medias: [],
    },
  });

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [buildInPublicData, setBuildInPublicData] = useState<BuildInPublicData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentValue = watch('content');
  const mediaFiles = watch('medias');

  // Brouillons persistés côté serveur (cross-device) : autosave débounce du
  // composer + liste de brouillons pour reprendre. Nettoyé à la publication.
  const queryClient = useQueryClient();
  const currentDraftId = useRef<string | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const { data: drafts = [] } = useQuery({
    queryKey: ['post-drafts'],
    queryFn: listDrafts,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    const content = (contentValue ?? '').trim();
    if (!content) return;
    const timer = setTimeout(async () => {
      try {
        if (currentDraftId.current) {
          await updateDraft(currentDraftId.current, contentValue, selectedTags);
        } else {
          const created = await createDraft(contentValue, selectedTags);
          currentDraftId.current = created.id;
        }
        queryClient.invalidateQueries({ queryKey: ['post-drafts'] });
      } catch {
        /* autosave best-effort */
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [contentValue, selectedTags, queryClient]);

  const resumeDraft = useCallback(
    (d: PostDraft) => {
      setValue('content', d.content);
      setSelectedTags(d.tags as Tags[]);
      setValue('tags', d.tags as Tags[]);
      currentDraftId.current = d.id;
      setIsInputFocused(true);
      setShowDrafts(false);
    },
    [setValue],
  );

  const removeDraft = useCallback(
    async (id: string) => {
      try {
        await deleteDraft(id);
        if (currentDraftId.current === id) currentDraftId.current = null;
        queryClient.invalidateQueries({ queryKey: ['post-drafts'] });
      } catch {
        /* ignore */
      }
    },
    [queryClient],
  );

  // Mentions : autocomplete @ dans le composer.
  const composerRef = useRef<HTMLDivElement>(null);
  const contentReg = register('content');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const { data: mentionResults } = useSearchProfiles(mentionQuery ?? '', 6);

  const detectMention = useCallback((el: HTMLTextAreaElement) => {
    const pos = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, pos);
    const m = before.match(/(?:^|\s)@([\p{L}0-9_]{0,30})$/u);
    if (m) {
      setMentionQuery(m[1]);
      setMentionStart(pos - m[1].length - 1); // position du '@'
    } else {
      setMentionQuery(null);
    }
  }, []);

  const selectMention = useCallback(
    (profile: { id: string; firstName: string; lastName?: string }) => {
      const el = composerRef.current?.querySelector('textarea') ?? null;
      const value = contentValue ?? '';
      const pos = el?.selectionStart ?? value.length;
      const fullName = `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`.trim();
      const token = `@[${fullName}](${profile.id}) `;
      const newValue = value.slice(0, mentionStart) + token + value.slice(pos);
      setValue('content', newValue, { shouldValidate: true });
      setMentionQuery(null);
    },
    [contentValue, mentionStart, setValue],
  );

  const hasContent = contentValue && contentValue.trim().length > 0;
  const isSubmitDisabled = isCreatingPost || !hasContent;

  useEffect(() => {
    if (mediaFiles && mediaFiles.length > 0) {
      const filesArray = Array.from(mediaFiles);
      const objectUrls = filesArray.map((file) => {
        // Only create object URLs for images and videos for preview
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
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

      // Get current files or initialize empty array
      const currentFiles = mediaFiles ? Array.from(mediaFiles) : [];

      // Append new files to existing files
      const updatedFiles = [...currentFiles, ...Array.from(newFiles)];


      // Check for file category consistency (images, videos, or documents)
      const categories = updatedFiles.map((file) => getFileCategory(file.type));
      const firstCategory = categories[0];
      const isMixed = categories.some((category) => category !== firstCategory);

      if (isMixed) {
        setError(
          'Please select files of the same type only (all images, all videos, or all documents).',
        );
        return;
      }

      // Clear any previous error
      setError(null);

      // Update form with combined files
      setValue('medias', updatedFiles);

      // Reset the file input so the same file can be selected again
      event.target.value = '';
    },
    [mediaFiles, setValue],
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      if (!mediaFiles) return;

      const updatedFiles = Array.from(mediaFiles);
      updatedFiles.splice(index, 1); // Remove the file at the specific index
      setValue('medias', updatedFiles); // Update the form field

      // Clear error if all files are removed
      if (updatedFiles.length === 0) {
        setError(null);
      }
    },
    [mediaFiles, setValue],
  );

  const handleTagsChange = useCallback(
    (tags: Tags[]) => {
      setSelectedTags(tags);
      setValue('tags', tags); // Sync with form state
    },
    [setValue],
  );

  const resetForm = useCallback(() => {
    setValue('content', '');
    setValue('medias', []);
    setValue('tags', []);
    setSelectedTags([]);
    setPreviews([]);
    setIsInputFocused(false);
    setError(null);
    setBuildInPublicData(null);
  }, [setValue]);

  const onSubmit: SubmitHandler<CreatePostType> = async (data) => {
    // Validate that we have either content or media
    const hasContent = data.content && data.content.trim().length > 0;
    const hasMedia = data.medias && data.medias.length > 0;

    if (!hasContent && !hasMedia) {
      return;
    }

    try {
      // Encode build in public data into content if present
      let finalContent = data.content || '';
      if (buildInPublicData) {
        finalContent = encodeBuildInPublicData(finalContent, buildInPublicData);
        // Auto-add BUILD_IN_PUBLIC tag if not already present
        if (!selectedTags.includes(Tags.BUILD_IN_PUBLIC)) {
          const newTags = [...selectedTags, Tags.BUILD_IN_PUBLIC];
          setSelectedTags(newTags);
          setValue('tags', newTags);
        }
      }

      await createPostMutation({
        ...data,
        content: finalContent,
      });
      // Publié → supprimer le brouillon associé.
      if (currentDraftId.current) {
        deleteDraft(currentDraftId.current).catch(() => {});
        currentDraftId.current = null;
        queryClient.invalidateQueries({ queryKey: ['post-drafts'] });
      }
      resetForm();
      setBuildInPublicData(null);
      setIsInputFocused(false);
      // Call onSuccess callback if provided (e.g., to close modal)
      onSuccess?.();
    } catch {
      // Error handling
    }
  };

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(onSubmit)(e);
      }}
      className="w-full"
    >
      <div className="flex items-start">
        {isLoading && (
          <div className="w-10 h-10 mr-3 bg-gray-200 rounded-full animate-pulse" />
        )}
        {user && (
          <Avatar
            size="md"
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            firstName={user.firstName}
            lastName={user.lastName}
            className="mr-3"
          />
        )}
        <div className="flex-1">
          {drafts.length > 0 && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setShowDrafts((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-[#5E6AD2] hover:text-[#5E6AD2]"
              >
                <FileEdit className="h-3.5 w-3.5" />
                Brouillons ({drafts.length})
              </button>
              {showDrafts && (
                <div className="mt-2 space-y-1.5 rounded-lg border border-gray-200 bg-white p-2">
                  {drafts.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50">
                      <button
                        type="button"
                        onClick={() => resumeDraft(d)}
                        className="min-w-0 flex-1 truncate text-left text-sm text-gray-700"
                        title={d.content}
                      >
                        {d.content.trim().slice(0, 80) || 'Brouillon vide'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDraft(d.id)}
                        className="text-gray-300 hover:text-red-500"
                        aria-label="Supprimer le brouillon"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="relative" ref={composerRef}>
            <TextArea
              {...contentReg}
              onChange={(e) => {
                contentReg.onChange(e);
                detectMention(e.target as HTMLTextAreaElement);
              }}
              onKeyUp={(e) => detectMention(e.currentTarget as HTMLTextAreaElement)}
              onClick={(e) => detectMention(e.currentTarget as HTMLTextAreaElement)}
              onFocus={() => setIsInputFocused(true)}
              disabled={isCreatingPost}
              placeholder="What's on your mind? Tapez @ pour mentionner"
              maxLength={VALIDATION_LIMITS.POST.CONTENT_MAX}
              className="min-h-[40px] bg-gray-50 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {mentionQuery !== null && (mentionResults?.length ?? 0) > 0 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {mentionResults!.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectMention(p);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <MentionAvatar
                      size="xs"
                      src={(p as any).avatar}
                      alt={`${p.firstName} ${p.lastName ?? ''}`}
                      firstName={p.firstName}
                      lastName={p.lastName}
                    />
                    <span className="text-sm text-gray-800">
                      {p.firstName} {p.lastName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.content && (
            <p className="text-red-500 text-sm mt-2">
              {errors.content.message}
            </p>
          )}
          {contentValue && contentValue.length > VALIDATION_LIMITS.POST.CONTENT_MAX * 0.8 && (
            <p className={`text-sm mt-1 ${contentValue.length >= VALIDATION_LIMITS.POST.CONTENT_MAX ? 'text-red-500' : 'text-yellow-600'}`}>
              {contentValue.length} / {VALIDATION_LIMITS.POST.CONTENT_MAX}
            </p>
          )}
          {isInputFocused && (
            <CreatePostTags
              isCreatingPost={isCreatingPost}
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
          )}
          {errors.tags && (
            <p className="text-red-500 text-sm mt-2">
              {errors.tags.message as string}
            </p>
          )}
          {isInputFocused && (
            <CreateBuildInPublicPost
              onDataChange={setBuildInPublicData}
              initialData={buildInPublicData || undefined}
            />
          )}
          {mediaFiles && mediaFiles.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <div className="space-y-2">
                {Array.from(mediaFiles).map((file, index) => (
                  <SelectedFile
                    key={`${file.name}-${index}`}
                    url={previews[index]}
                    index={index}
                    handleRemoveFile={() => handleRemoveFile(index)}
                    file={file}
                  />
                ))}
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}
        </div>
      </div>

      {isInputFocused && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex gap-4">
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
              color="secondary"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
              onClick={() => fileInputRef.current?.click()}
              iconLeading={<ImageIcon data-icon />}
            >
              Media
            </Button>
          </div>
          <Button 
            type="submit" 
            size="sm" 
            color="primary"
            isDisabled={isSubmitDisabled}
          >
            {isCreatingPost ? 'Posting...' : 'Post'}
          </Button>
        </div>
      )}
    </form>
  );
};

const SelectedFile = memo(
  ({
    url,
    index,
    handleRemoveFile,
    file,
  }: {
    url: string | null;
    index: number;
    handleRemoveFile: () => void;
    file: File;
  }) => {
    const fileCategory = getFileCategory(file.type);

    const renderPreview = () => {
      if (fileCategory === 'image' && url) {
        return (
          <Image
            src={url}
            alt={`Preview ${index + 1}`}
            fill
            className="object-cover rounded-md"
          />
        );
      } else if (fileCategory === 'video' && url) {
        return (
          <video
            src={url}
            className="w-full h-full object-cover rounded-md"
            muted
          />
        );
      } else {
        // For documents or files without preview
        const IconComponent = fileCategory === 'video' ? Video : FileText;
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
            <IconComponent className="w-6 h-6 text-gray-400" />
          </div>
        );
      }
    };

    return (
      <div className="flex items-center gap-2">
        <div className="relative w-16 h-16 flex-shrink-0">
          {renderPreview()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemoveFile}
          className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  },
);

SelectedFile.displayName = 'SelectedFile';

interface CreatePostTagsProps {
  isCreatingPost: boolean;
  selectedTags: Tags[];
  onTagsChange: (tags: Tags[]) => void;
}

const CreatePostTags: React.FC<CreatePostTagsProps> = ({
  isCreatingPost,
  selectedTags,
  onTagsChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTagClick = (tag: Tags) => {
    let newTags: Tags[];

    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter((t) => t !== tag);
    } else if (selectedTags.length < VALIDATION_LIMITS.POST.TAGS_MAX_COUNT) {
      newTags = [...selectedTags, tag];
    } else {
      return;
    }

    onTagsChange(newTags);
  };

  const filteredTags = tagList.filter(tag => 
    !selectedTags.includes(tag.enum) && 
    tag.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fermer la dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.tag-dropdown')) {
        setOpen(false);
        setSearchTerm('');
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag, tagIndex) => {
          const tagData = tagList.find((t) => t.enum === tag);
          if (!tagData) return null;
          return (
            <Badge
              key={`tag-${tag}-${tagIndex}`}
              type="pill-color"
              color="brand"
              size="sm"
              className={`flex items-center gap-1 px-2 py-1 ${tagData.bgColor} ${tagData.textColor} ${tagData.hoverBgColor}`}
            >
              {tagData.icon} {tagData.title}
              <X
                className={`w-3 h-3 stroke-[4] ${tagData.iconColor} cursor-pointer`}
                onClick={() => handleTagClick(tag)}
              />
            </Badge>
          );
        })}
        {selectedTags.length < VALIDATION_LIMITS.POST.TAGS_MAX_COUNT && (
          <div className="relative tag-dropdown">
            <Button
              color="secondary"
              isDisabled={isCreatingPost}
              className="flex items-center gap-1 px-2 h-6 text-xs"
              onClick={() => setOpen(!open)}
              iconLeading={<Plus data-icon />}
            >
              Add Tags
            </Button>
            {open && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <button
                        key={tag.enum}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                        onClick={() => {
                          handleTagClick(tag.enum);
                          setOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No tags found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
