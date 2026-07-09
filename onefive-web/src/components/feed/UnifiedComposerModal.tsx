'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Image as ImageIcon, BarChart2, HelpCircle, Rocket, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/base/dialog/dialog';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { TagSelector } from '@/components/feed/TagSelector';
import { CreatePost } from '@/features/post/components/CreatePost';
import { createDiscussion } from '@/queries/discussion';
import { DiscussionType, Tags } from '@/enums';

type ComposerTab = 'text' | 'media' | 'poll' | 'question' | 'bip';

const TABS: { key: ComposerTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'text', label: 'Texte', Icon: FileText },
  { key: 'media', label: 'Média', Icon: ImageIcon },
  { key: 'poll', label: 'Sondage', Icon: BarChart2 },
  { key: 'question', label: 'Question', Icon: HelpCircle },
  { key: 'bip', label: 'Build in Public', Icon: Rocket },
];

interface UnifiedComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuildInPublic?: () => void;
}

/**
 * Composer unifié à onglets : Texte / Média créent un post (feed), Sondage /
 * Question créent une discussion. Un seul point d'entrée pour toute la création.
 */
export const UnifiedComposerModal = ({ open, onOpenChange, onBuildInPublic }: UnifiedComposerModalProps) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ComposerTab>('text');

  // État du formulaire discussion (sondage / question)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<Tags[]>([]);
  const [options, setOptions] = useState<string[]>(['', '']);

  const resetDiscussion = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setOptions(['', '']);
  };

  const createDiscussionMut = useMutation({
    mutationFn: () =>
      createDiscussion({
        question: title.trim(),
        content: content.trim(),
        tags,
        type: tab === 'poll' ? DiscussionType.POLL : DiscussionType.DISCUSSION,
        options: options.map((o) => o.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success(tab === 'poll' ? 'Sondage publié' : 'Question publiée');
      resetDiscussion();
      onOpenChange(false);
    },
    onError: () => toast.error('Erreur lors de la publication'),
  });

  const isDiscussionTab = tab === 'poll' || tab === 'question';
  const validOptions = options.filter((o) => o.trim()).length;
  const canSubmitDiscussion =
    title.trim().length >= 5 &&
    tags.length >= 1 &&
    (tab === 'question' || validOptions >= 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-white text-[#101828] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'bip' ? (
          <div className="space-y-4 py-6 text-center">
            <Rocket className="mx-auto h-10 w-10 text-[#5E6AD2]" />
            <p className="text-sm text-gray-600">
              Partagez une update, une métrique ou un lancement de votre startup — Build in Public.
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                onBuildInPublic?.();
              }}
            >
              Continuer
            </Button>
          </div>
        ) : !isDiscussionTab ? (
          <CreatePost onSuccess={() => onOpenChange(false)} />
        ) : (
          <div className="space-y-4">
            <Input
              label={tab === 'poll' ? 'Votre sondage' : 'Votre question'}
              placeholder={tab === 'poll' ? 'Quel est votre outil favori ?' : 'Comment gérez-vous… ?'}
              value={title}
              onChange={setTitle}
            />
            <TextArea
              label="Détails (optionnel)"
              placeholder="Ajoutez du contexte…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {tab === 'poll' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Options</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(v) => setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)))}
                    />
                    {options.length > 2 && (
                      <Button
                        iconLeading={X}
                        color="tertiary"
                        size="sm"
                        onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label="Retirer l'option"
                      />
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <Button
                    iconLeading={Plus}
                    color="tertiary"
                    size="sm"
                    onClick={() => setOptions((prev) => [...prev, ''])}
                  >
                    Ajouter une option
                  </Button>
                )}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tags (1 à 2)
              </label>
              <TagSelector selectedTags={tags} onTagsChange={setTags} maxTags={2} />
            </div>

            <div className="flex justify-end gap-2">
              <Button color="secondary" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button
                onClick={() => createDiscussionMut.mutate()}
                isDisabled={!canSubmitDiscussion || createDiscussionMut.isPending}
              >
                {createDiscussionMut.isPending ? 'Publication…' : 'Publier'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
