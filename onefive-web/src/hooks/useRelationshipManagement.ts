import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  ProfileReminder, 
  ProfileNote, 
  ProfileInteraction, 
  UseRelationshipManagement 
} from '@/types/relationships';

export function useRelationshipManagement(profileId: string): UseRelationshipManagement {
  const [tags, setTags] = useState<string[]>([]);
  const [reminders, setReminders] = useState<ProfileReminder[]>([]);
  const [notes, setNotes] = useState<ProfileNote[]>([]);
  const [interactions, _setInteractions] = useState<ProfileInteraction[]>([]);

  const addTag = useCallback((tagId: string) => {
    setTags(prev => {
      if (prev.includes(tagId)) {
        toast.error('Ce tag est déjà appliqué');
        return prev;
      }
      toast.success('Tag ajouté avec succès');
      return [...prev, tagId];
    });
  }, []);

  const removeTag = useCallback((tagId: string) => {
    setTags(prev => {
      const newTags = prev.filter(t => t !== tagId);
      toast.success('Tag retiré avec succès');
      return newTags;
    });
  }, []);

  const addReminder = useCallback((reminder: Omit<ProfileReminder, 'id'>) => {
    const newReminder: ProfileReminder = {
      ...reminder,
      id: `reminder-${Date.now()}`,
      profileId
    };
    
    setReminders(prev => [...prev, newReminder]);
    toast.success('Rappel créé avec succès');
  }, [profileId]);

  const addNote = useCallback((note: Omit<ProfileNote, 'id' | 'createdAt'>) => {
    const newNote: ProfileNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      profileId
    };
    
    setNotes(prev => [...prev, newNote]);
    toast.success('Note sauvegardée');
  }, [profileId]);

  const markReminderCompleted = useCallback((id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: true }
          : reminder
      )
    );
    toast.success('Rappel marqué comme terminé');
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast.success('Note supprimée');
  }, []);

  return {
    tags,
    reminders,
    notes,
    interactions,
    addTag,
    removeTag,
    addReminder,
    addNote,
    markReminderCompleted,
    deleteNote
  };
} 