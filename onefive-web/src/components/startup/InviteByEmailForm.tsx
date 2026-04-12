import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';

interface InviteByEmailFormProps {
  searchQuery: string;
  onInvite: (email: string, firstName: string, lastName: string) => void;
  onCancel?: () => void;
}

export const InviteByEmailForm = ({ searchQuery, onInvite, onCancel }: InviteByEmailFormProps) => {
  const [formData, setFormData] = useState({
    firstName: searchQuery.split(' ')[0] || '',
    lastName: searchQuery.split(' ').slice(1).join(' ') || '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prénom requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nom requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onInvite(formData.email, formData.firstName, formData.lastName);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Input
            placeholder="Prénom"
            value={formData.firstName}
            onChange={(value: string) => handleInputChange('firstName', value)}
            isInvalid={!!errors.firstName}
            className="text-sm"
          />
        </div>
        <div>
          <Input
            placeholder="Nom"
            value={formData.lastName}
            onChange={(value: string) => handleInputChange('lastName', value)}
            isInvalid={!!errors.lastName}
            className="text-sm"
          />
        </div>
      </div>

      <Input
        type="email"
        placeholder="email@exemple.com"
        value={formData.email}
        onChange={(value: string) => handleInputChange('email', value)}
        isInvalid={!!errors.email}
        className="text-sm"
      />

      <TextArea
        placeholder="Message d'invitation (optionnel)"
        value={formData.message}
        onChange={(e: any) => handleInputChange('message', typeof e === 'string' ? e : e.target.value)}
      />

      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex-1"
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="flex-1"
        >
          <Mail className="mr-2" size={16} />
          Envoyer l'invitation
        </Button>
      </div>
    </form>
  );
};

export default InviteByEmailForm;
