/**
 * Exemple d'utilisation des constantes de validation dans les composants React
 */

import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@/constants/validation-limits';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ==================== EXEMPLE 1 : Profile Edit Form ====================

const profileSchema = z.object({
  firstName: z.string()
    .min(1, VALIDATION_MESSAGES.FIRST_NAME_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX, VALIDATION_MESSAGES.FIRST_NAME_TOO_LONG),
  
  lastName: z.string()
    .min(1, VALIDATION_MESSAGES.LAST_NAME_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.LAST_NAME_MAX, VALIDATION_MESSAGES.LAST_NAME_TOO_LONG),
  
  title: z.string()
    .min(1, VALIDATION_MESSAGES.TITLE_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.TITLE_MAX, VALIDATION_MESSAGES.TITLE_TOO_LONG),
  
  bio: z.string()
    .min(1, VALIDATION_MESSAGES.BIO_REQUIRED)
    .max(VALIDATION_LIMITS.PROFILE.BIO_MAX, VALIDATION_MESSAGES.BIO_TOO_LONG),
  
  skills: z.array(
    z.string().max(VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX)
  ).max(VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT, VALIDATION_MESSAGES.SKILLS_TOO_MANY).optional(),
  
  socials: z.array(z.object({
    title: z.string().max(VALIDATION_LIMITS.PROFILE.SOCIAL_TITLE_MAX),
    url: z.string().url().max(VALIDATION_LIMITS.PROFILE.SOCIAL_URL_MAX),
  })).max(VALIDATION_LIMITS.PROFILE.SOCIALS_MAX_COUNT).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileEditForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const bio = watch('bio', '');

  const onSubmit = (_data: ProfileFormValues) => {
    // Example only — wire to your API as needed
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Prénom avec limite visible */}
      <Input
        label="Prénom *"
        placeholder="Votre prénom"
        maxLength={VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX}
        error={errors.firstName?.message}
        {...register('firstName')}
      />

      {/* Bio avec compteur de caractères */}
      <div className="relative">
        <TextArea
          label="Bio *"
          placeholder="Parlez-nous de vous..."
          maxLength={VALIDATION_LIMITS.PROFILE.BIO_MAX}
          rows={4}
          error={errors.bio?.message}
          {...register('bio')}
        />
        <span className="absolute bottom-2 right-2 text-xs text-gray-400">
          {bio?.length || 0} / {VALIDATION_LIMITS.PROFILE.BIO_MAX}
        </span>
      </div>

      <Button type="submit">Enregistrer</Button>
    </form>
  );
}

// ==================== EXEMPLE 2 : Create Post Form ====================

const postSchema = z.object({
  content: z.string()
    .max(VALIDATION_LIMITS.POST.CONTENT_MAX, VALIDATION_MESSAGES.CONTENT_TOO_LONG)
    .optional(),
  
  medias: z.array(z.object({
    url: z.string(),
    type: z.enum(['image', 'video']),
  })).max(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT, VALIDATION_MESSAGES.MEDIAS_TOO_MANY).optional(),
  
  tags: z.array(
    z.string().max(VALIDATION_LIMITS.POST.TAG_MAX)
  ).max(VALIDATION_LIMITS.POST.TAGS_MAX_COUNT, VALIDATION_MESSAGES.TAGS_TOO_MANY).optional(),
});

export function CreatePostForm() {
  const [medias, setMedias] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const handleAddMedia = (file: File) => {
    if (medias.length >= VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT) {
      toast.error(VALIDATION_MESSAGES.MEDIAS_TOO_MANY);
      return;
    }
    setMedias([...medias, file]);
  };

  const handleAddTag = (tag: string) => {
    if (tags.length >= VALIDATION_LIMITS.POST.TAGS_MAX_COUNT) {
      toast.error(VALIDATION_MESSAGES.TAGS_TOO_MANY);
      return;
    }
    
    if (tag.length > VALIDATION_LIMITS.POST.TAG_MAX) {
      toast.error(`Un tag ne peut pas dépasser ${VALIDATION_LIMITS.POST.TAG_MAX} caractères`);
      return;
    }
    
    setTags([...tags, tag]);
  };

  return (
    <form>
      <TextArea
        placeholder="Quoi de neuf ?"
        maxLength={VALIDATION_LIMITS.POST.CONTENT_MAX}
        rows={4}
      />
      
      <div className="flex items-center gap-2">
        <MediaUploadButton 
          onUpload={handleAddMedia}
          disabled={medias.length >= VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT}
        />
        {medias.length > 0 && (
          <span className="text-xs text-gray-400">
            {medias.length}/{VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT} médias
          </span>
        )}
      </div>

      <TagInput 
        onAdd={handleAddTag}
        tags={tags}
        maxTags={VALIDATION_LIMITS.POST.TAGS_MAX_COUNT}
      />
    </form>
  );
}

// ==================== EXEMPLE 3 : Create Discussion Form ====================

const discussionSchema = z.object({
  question: z.string()
    .min(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN, VALIDATION_MESSAGES.QUESTION_TOO_SHORT)
    .max(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX, VALIDATION_MESSAGES.QUESTION_TOO_LONG),
  
  content: z.string()
    .max(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX, VALIDATION_MESSAGES.CONTENT_TOO_LONG_DISCUSSION)
    .optional(),
  
  tags: z.array(z.string())
    .min(VALIDATION_LIMITS.DISCUSSION.TAGS_MIN_COUNT, VALIDATION_MESSAGES.TAGS_TOO_FEW)
    .max(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT, VALIDATION_MESSAGES.TAGS_TOO_MANY_DISCUSSION),
  
  options: z.array(z.string())
    .min(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MIN_COUNT, VALIDATION_MESSAGES.OPTIONS_TOO_FEW)
    .max(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT, VALIDATION_MESSAGES.OPTIONS_TOO_MANY)
    .optional(),
});

export function CreateDiscussionForm() {
  const [options, setOptions] = useState<string[]>([]);

  const handleAddOption = (option: string) => {
    if (options.length >= VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT) {
      toast.error(VALIDATION_MESSAGES.OPTIONS_TOO_MANY);
      return;
    }
    
    if (option.length > VALIDATION_LIMITS.DISCUSSION.OPTION_MAX) {
      toast.error(`Une option ne peut pas dépasser ${VALIDATION_LIMITS.DISCUSSION.OPTION_MAX} caractères`);
      return;
    }
    
    setOptions([...options, option]);
  };

  return (
    <form>
      <Input
        label="Question *"
        placeholder="Posez votre question..."
        maxLength={VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX}
      />
      
      <TextArea
        label="Contexte (optionnel)"
        placeholder="Donnez plus de détails..."
        maxLength={VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX}
        rows={4}
      />

      {/* Poll options with validation */}
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={option}
            maxLength={VALIDATION_LIMITS.DISCUSSION.OPTION_MAX}
            readOnly
          />
          <Button onClick={() => setOptions(options.filter((_, i) => i !== index))}>
            Supprimer
          </Button>
        </div>
      ))}
      
      {options.length < VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT && (
        <Button onClick={() => handleAddOption('')}>
          Ajouter une option ({options.length}/{VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT})
        </Button>
      )}
    </form>
  );
}

// ==================== EXEMPLE 4 : Experience Form ====================

export function ExperienceForm() {
  const [experiences, setExperiences] = useState([]);

  const handleAddExperience = () => {
    if (experiences.length >= VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE) {
      toast.error(VALIDATION_MESSAGES.MAX_EXPERIENCES_REACHED);
      return;
    }
    
    setExperiences([...experiences, { id: Date.now() }]);
  };

  return (
    <div>
      {experiences.map((exp) => (
        <div key={exp.id} className="border p-4 rounded mb-4">
          <Input
            label="Titre *"
            placeholder="Ex: Senior Backend Developer"
            maxLength={VALIDATION_LIMITS.EXPERIENCE.TITLE_MAX}
          />
          
          <Input
            label="Entreprise *"
            placeholder="Ex: Google"
            maxLength={VALIDATION_LIMITS.EXPERIENCE.COMPANY_MAX}
          />
          
          <TextArea
            label="Description"
            placeholder="Décrivez vos responsabilités..."
            maxLength={VALIDATION_LIMITS.EXPERIENCE.DESCRIPTION_MAX}
            rows={4}
          />
        </div>
      ))}
      
      {experiences.length < VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE && (
        <Button onClick={handleAddExperience}>
          Ajouter une expérience ({experiences.length}/{VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE})
        </Button>
      )}
    </div>
  );
}

// ==================== EXEMPLE 5 : Startup Form ====================

const startupSchema = z.object({
  name: z.string()
    .min(VALIDATION_LIMITS.STARTUP.NAME_MIN, VALIDATION_MESSAGES.NAME_REQUIRED)
    .max(VALIDATION_LIMITS.STARTUP.NAME_MAX),
  
  tagline: z.string()
    .max(VALIDATION_LIMITS.STARTUP.TAGLINE_MAX, VALIDATION_MESSAGES.TAGLINE_REQUIRED),
  
  description: z.string()
    .max(VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX, VALIDATION_MESSAGES.DESCRIPTION_REQUIRED),
  
  categories: z.array(z.string())
    .max(VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT, VALIDATION_MESSAGES.CATEGORIES_TOO_MANY),
  
  invitations: z.array(z.object({
    email: z.string().email(),
    firstName: z.string().max(VALIDATION_LIMITS.STARTUP.FIRST_NAME_MAX),
    lastName: z.string().max(VALIDATION_LIMITS.STARTUP.LAST_NAME_MAX),
    position: z.string().max(VALIDATION_LIMITS.STARTUP.POSITION_MAX),
    message: z.string().max(VALIDATION_LIMITS.STARTUP.MESSAGE_MAX).optional(),
  })).max(VALIDATION_LIMITS.STARTUP.INVITATIONS_MAX_COUNT, VALIDATION_MESSAGES.INVITATIONS_TOO_MANY).optional(),
});

export function CreateStartupForm() {
  const [categories, setCategories] = useState<string[]>([]);
  const [invitations, setInvitations] = useState([]);

  const handleAddCategory = (category: string) => {
    if (categories.length >= VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT) {
      toast.error(VALIDATION_MESSAGES.CATEGORIES_TOO_MANY);
      return;
    }
    setCategories([...categories, category]);
  };

  const handleAddInvitation = () => {
    if (invitations.length >= VALIDATION_LIMITS.STARTUP.INVITATIONS_MAX_COUNT) {
      toast.error(VALIDATION_MESSAGES.INVITATIONS_TOO_MANY);
      return;
    }
    setInvitations([...invitations, { id: Date.now() }]);
  };

  return (
    <form>
      <Input
        label="Nom de la startup *"
        placeholder="Ex: OneFive"
        maxLength={VALIDATION_LIMITS.STARTUP.NAME_MAX}
      />
      
      <Input
        label="Slogan *"
        placeholder="Ex: Le réseau social des entrepreneurs"
        maxLength={VALIDATION_LIMITS.STARTUP.TAGLINE_MAX}
      />
      
      <TextArea
        label="Description *"
        placeholder="Décrivez votre startup..."
        maxLength={VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX}
        rows={6}
      />

      {/* Categories avec limite */}
      <CategorySelector
        selected={categories}
        onSelect={handleAddCategory}
        maxCategories={VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT}
      />

      {/* Invitations avec limite */}
      {invitations.length < VALIDATION_LIMITS.STARTUP.INVITATIONS_MAX_COUNT && (
        <Button onClick={handleAddInvitation}>
          Inviter un co-fondateur ({invitations.length}/{VALIDATION_LIMITS.STARTUP.INVITATIONS_MAX_COUNT})
        </Button>
      )}
    </form>
  );
}
