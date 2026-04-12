'use client';

import { useEffect, useMemo, useState } from 'react';
import { XIcon, Plus } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Label } from '@/components/base/input/label';
import { Dialog, DialogTrigger, Modal, ModalOverlay } from '@/components/application/modals/modal';
import { DiscussionType } from '@/enums';
import { tags as tagsConst } from '@/constant';
import { Select } from '@/components/base/select/select';
import { Badge } from '@/components/ui/badge';
import { SaaSSelector } from '@/components/ui/saas-selector';
import { SaaS } from '../../../../config/saas';

export interface EditDiscussionInitialValues {
  title: string;
  content: string;
  options: string[];
  chosenTags: string[];
  discussionType: DiscussionType;
  saas: SaaS | null;
}

interface EditDiscussionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: EditDiscussionInitialValues;
  onSubmit: (data: EditDiscussionInitialValues) => void;
  isLoading: boolean;
}

export const EditDiscussionModal = ({
  isOpen,
  onOpenChange,
  initialValues,
  onSubmit,
  isLoading,
}: EditDiscussionModalProps) => {
  const [discussionType, setDiscussionType] = useState<DiscussionType>(initialValues.discussionType);
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [options, setOptions] = useState<string[]>(initialValues.options);
  const [chosenTags, setChosenTags] = useState<string[]>(initialValues.chosenTags);
  const [saas, setSaas] = useState<SaaS | null>(initialValues.saas);

  useEffect(() => {
    if (!isOpen) return;
    setDiscussionType(initialValues.discussionType);
    setTitle(initialValues.title);
    setContent(initialValues.content);
    setOptions(initialValues.options);
    setChosenTags(initialValues.chosenTags);
    setSaas(initialValues.saas);
  }, [isOpen, initialValues]);

  const handleOptionChange = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const next = options.filter((_, i) => i !== index);
    setOptions(next);
  };

  const canSave = () => {
    if (title.trim().length < 5) {
      return true;
    }

    if (discussionType === DiscussionType.DISCUSSION) {
      return title.length === 0 || chosenTags.length < 1 || chosenTags.length > 2;
    }
    if (discussionType === DiscussionType.POLL || discussionType === DiscussionType.POLL_MULTIPLE) {
      return title.length === 0 || chosenTags.length < 1 || chosenTags.length > 2 || options.filter(o => o.trim() !== '').length < 2;
    }
    return false;
  };

  const availableTags = useMemo(
    () =>
      tagsConst
        .filter(tag => !chosenTags.includes(tag.enum))
        .map(tag => ({
          id: tag.enum,
          value: tag.enum,
          label: tag.title,
        })),
    [chosenTags],
  );

  const handleAddTag = (tagValue: string) => {
    if (chosenTags.length >= 2) {
      return;
    }
    if (tagValue && !chosenTags.includes(tagValue)) {
      setChosenTags([...chosenTags, tagValue]);
    }
  };

  const handleRemoveTag = (tagValue: string) => {
    setChosenTags(chosenTags.filter(t => t !== tagValue));
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      content,
      options: options.filter(option => option.trim() !== ''),
      chosenTags,
      discussionType,
      saas,
    });
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay>
        <Modal>
          <Dialog>
            {({ close }) => (
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b shrink-0">
                  <h2 className="text-xl font-semibold">Modifier la discussion</h2>
                  <p className="text-sm text-gray-500">Mettez à jour votre question et son contenu</p>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto p-6">
                  <div className="space-y-3">
                    <Label>Type de discussion</Label>
                    <div className="text-sm text-gray-600">
                      {discussionType === DiscussionType.DISCUSSION
                        ? 'Discussion'
                        : discussionType === DiscussionType.POLL
                          ? 'Sondage'
                          : 'Sondage multiple'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Contexte (optionnel)</Label>
                    <div className="text-sm text-muted-foreground mb-2">
                      Spécifiez si votre question concerne un SaaS ou une entreprise particulière
                    </div>
                    <SaaSSelector value={saas} onValueChange={setSaas} />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="title">
                      {discussionType === DiscussionType.DISCUSSION ? 'Question' : 'Question du sondage'}
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={setTitle}
                      placeholder={
                        discussionType === DiscussionType.DISCUSSION
                          ? 'Ex. Quels sont les meilleurs conseils pour entrepreneurs ?'
                          : 'Ex. Quel outil préférez-vous pour la gestion de projet ?'
                      }
                    />
                    {title.trim().length > 0 && title.trim().length < 5 && (
                      <p className="text-xs text-destructive">
                        La question doit contenir au moins 5 caractères ({title.trim().length}/5)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="content">
                      Détails supplémentaires <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </Label>
                    <TextArea
                      id="content"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Ajoutez plus de contexte, des exemples ou des précisions..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {(discussionType === DiscussionType.POLL || discussionType === DiscussionType.POLL_MULTIPLE) && (
                    <div className="space-y-3">
                      <Label>
                        Options de sondage <span className="text-muted-foreground font-normal">(min: 2)</span>
                      </Label>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={value => handleOptionChange(index, value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button
                              color="tertiary"
                              onClick={() => removeOption(index)}
                              disabled={options.length <= 2}
                              className="shrink-0"
                              iconLeading={<XIcon data-icon />}
                            >
                              {''}
                            </Button>
                          </div>
                        ))}
                        <Button color="secondary" onClick={addOption} className="w-full" iconLeading={<Plus data-icon />}>
                          Ajouter une option
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Tags <span className="text-muted-foreground font-normal">(min: 1, max: 2)</span></Label>
                    <Select
                      aria-label="Tags"
                      placeholder="Rechercher un tag..."
                      items={availableTags}
                      selectedKey={null}
                      onSelectionChange={(key) => {
                        if (key) {
                          handleAddTag(key as string);
                        }
                      }}
                    >
                      {(item) => (
                        <Select.Item key={item.id} id={item.id}>
                          {item.label}
                        </Select.Item>
                      )}
                    </Select>

                    {chosenTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {chosenTags.map((tagValue) => {
                          const tag = tagsConst.find(t => t.enum === tagValue);
                          if (!tag) return null;
                          return (
                            <Badge
                              key={tagValue}
                              className={`pl-2 pr-1 py-1 flex items-center gap-1.5 border-0 ${tag.bgColor} ${tag.textColor} ${tag.hoverBgColor}`}
                            >
                              <span className="text-sm">{tag.icon}</span>
                              <span className="font-medium">{tag.title}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tagValue)}
                                className={`ml-0.5 rounded-sm hover:bg-black/10 p-0.5 transition-colors ${tag.iconColor}`}
                                aria-label={`Retirer ${tag.title}`}
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t flex items-center justify-end gap-3 shrink-0">
                  <Button color="secondary" onClick={close} disabled={isLoading}>
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      handleSubmit();
                      close();
                    }}
                    disabled={canSave() || isLoading}
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
