'use client';

import { useState } from 'react';
import { XIcon, Plus, MessageSquare, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Label } from '@/components/base/input/label';
import { Dialog, DialogTrigger, Modal, ModalOverlay } from '@/components/application/modals/modal';
import { Tabs, Tab, TabList } from '@/components/application/tabs/tabs';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/base/select/select';
import { SaaSSelector } from '@/components/ui/saas-selector';
import { DiscussionType } from '@/enums';
import { tags } from '@/constant';
import { SaaS } from '../../../../config/saas';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    content: string;
    options: string[];
    chosenTags: string[];
    discussionType: DiscussionType;
    saas: SaaS | null;
  }) => void;
  isLoading: boolean;
}

export const CreateDiscussionModal = ({ isOpen, onOpenChange, onSubmit, isLoading }: CreateDiscussionModalProps) => {
  const [discussionType, setDiscussionType] = useState<DiscussionType>(DiscussionType.DISCUSSION);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [chosenTags, setChosenTags] = useState<string[]>([]);
  const [_tagSearch, setTagSearch] = useState('');
  const [saas, setSaas] = useState<SaaS | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const resetModalState = () => {
    setTitle('');
    setContent('');
    setOptions([]);
    setChosenTags([]);
    setDiscussionType(DiscussionType.DISCUSSION);
    setSaas(null);
  };

  const handleModalOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        resetModalState();
      }, 150);
    }
  };

  const canPost = () => {
    // Validation: question must be between 5-200 characters (backend requirement)
    if (title.trim().length < VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN || 
        title.trim().length > VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX) {
      return true; // Disable submit if question is invalid
    }
    
    if (discussionType === DiscussionType.DISCUSSION) {
      return title.length === 0 || chosenTags.length < 1 || chosenTags.length > 2;
    }
    if (discussionType === DiscussionType.POLL || discussionType === DiscussionType.POLL_MULTIPLE) {
      return title.length === 0 || chosenTags.length < 1 || chosenTags.length > 2 || options.filter(o => o.trim() !== '').length < 2;
    }
    return false;
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

  const getDiscussionTypeIcon = (type: DiscussionType) => {
    switch (type) {
      case DiscussionType.DISCUSSION:
        return <MessageSquare className="h-4 w-4" />;
      case DiscussionType.POLL:
        return <BarChart3 className="h-4 w-4" />;
      case DiscussionType.POLL_MULTIPLE:
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: DiscussionType.DISCUSSION, label: 'Discussion' },
    { id: DiscussionType.POLL, label: 'Sondage' },
    { id: DiscussionType.POLL_MULTIPLE, label: 'Sondage multiple' },
  ];

  const availableTags = tags
    .filter(tag => !chosenTags.includes(tag.enum))
    .map(tag => ({
      id: tag.enum,
      value: tag.enum,
      label: tag.title,
    }));

  const handleAddTag = (tagValue: string) => {
    if (chosenTags.length >= 2) {
      return;
    }
    if (tagValue && !chosenTags.includes(tagValue)) {
      setChosenTags([...chosenTags, tagValue]);
      setTagSearch('');
    }
  };

  const handleRemoveTag = (tagValue: string) => {
    setChosenTags(chosenTags.filter(t => t !== tagValue));
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleModalOpenChange}>
      <ModalOverlay>
        <Modal>
          <Dialog>
            {({ close }) => (
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b shrink-0">
                  <h2 className="text-xl font-semibold">Nouvelle discussion</h2>
                  <p className="text-sm text-gray-500">Partagez votre question avec la communauté</p>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto p-6">
                  <div className="space-y-3">
                    <Label>Type de discussion</Label>
                    <Tabs
                      selectedKey={discussionType}
                      onSelectionChange={key => {
                        const newType = key as DiscussionType;
                        switch (newType) {
                          case DiscussionType.DISCUSSION:
                          case DiscussionType.POLL:
                          case DiscussionType.POLL_MULTIPLE:
                            setDiscussionType(newType);
                            if (newType === DiscussionType.DISCUSSION) {
                              setOptions([]);
                            } else {
                              if (options.length === 0) {
                                setOptions(['', '']);
                              }
                            }
                            break;
                          default:
                            break;
                        }
                      }}
                    >
                      <TabList items={tabs} type="button-gray" className="grid w-full grid-cols-3">
                        {item => (
                          <Tab id={item.id}>
                            <div className="flex items-center gap-2">
                              {getDiscussionTypeIcon(item.id as DiscussionType)}
                              {item.label}
                            </div>
                          </Tab>
                        )}
                      </TabList>
                    </Tabs>
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
                      maxLength={VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX}
                      placeholder={
                        discussionType === DiscussionType.DISCUSSION
                          ? 'Ex. Quels sont les meilleurs conseils pour entrepreneurs ?'
                          : 'Ex. Quel outil préférez-vous pour la gestion de projet ?'
                      }
                    />
                    {title.trim().length > 0 && title.trim().length < VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN && (
                      <p className="text-xs text-destructive">
                        La question doit contenir au moins {VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN} caractères ({title.trim().length}/{VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN})
                      </p>
                    )}
                    {title.length > VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX * 0.8 && (
                      <p className={`text-xs ${title.length >= VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX ? 'text-destructive' : 'text-yellow-600'}`}>
                        {title.length} / {VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX}
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
                      maxLength={VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX}
                      placeholder="Ajoutez plus de contexte, des exemples ou des précisions..."
                      className="min-h-[100px]"
                    />
                    {content.length > VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX * 0.8 && (
                      <p className={`text-xs ${content.length >= VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX ? 'text-destructive' : 'text-yellow-600'}`}>
                        {content.length} / {VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX}
                      </p>
                    )}
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
                        <Button
                          color="secondary"
                          onClick={addOption}
                          className="w-full"
                          iconLeading={<Plus data-icon />}
                        >
                          Ajouter une option
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>
                      Tags <span className="text-muted-foreground font-normal">(min: 1, max: 2)</span>
                    </Label>
                    
                    {/* Sélecteur de tags simplifié */}
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
                    
                    {/* Tags sélectionnés */}
                    {chosenTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {chosenTags.map((tagValue) => {
                          const tag = tags.find(t => t.enum === tagValue);
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

                <div className="p-6 border-t shrink-0 flex justify-end gap-2">
                  <Button color="tertiary" onClick={close}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} isDisabled={canPost()} isLoading={isLoading}>
                    Publier
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
