import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/utils/kyInstance';

interface StreakData {
  currentStreak: number;
}

// Clé pour localStorage
const STREAK_LAST_UPDATED_KEY = 'streak_last_updated';

const createStreak = async (): Promise<StreakData> => {
  const response = await api.post('streak');
  const data: any = await response.json();
  return data.data;
};

export const useStreak = () => {
  const queryClient = useQueryClient();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Mutation pour créer la streak
  const createStreakMutation = useMutation({
    mutationFn: createStreak,
    onSuccess: (data) => {
      // Sauvegarder seulement le jour calendaire (pas la valeur de streak)
      const now = new Date();
      // Créer une date qui représente le jour calendaire en UTC (évite les problèmes de fuseau)
      const calendarDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      localStorage.setItem(STREAK_LAST_UPDATED_KEY, calendarDay.toISOString());
      setCurrentStreak(data.currentStreak);

      // Mettre à jour directement la streak dans le cache au lieu d'invalider
      queryClient.setQueryData(['profile', 'me'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            stats: {
              ...oldData.stats,
              streak: data.currentStreak,
            },
          };
        }
        return oldData;
      });

      // Invalider les statistiques pour cohérence
      queryClient.invalidateQueries({ queryKey: ['profile-statistics'] });

      // C'était une nouvelle connexion, vérifier si on doit afficher la modal
      checkModalVisibility(data.currentStreak);
    },
    onError: (error: any) => {
      // Si 409 Conflict (déjà connecté aujourd'hui), utiliser la valeur par défaut (0)
      if (error.response?.status === 409) {
        setCurrentStreak(0);
        checkModalVisibility(0);
      } else {
        // Pour les autres erreurs, on pourrait les logger
        console.error('Streak error:', error);
      }
    },
  });

  // Fonction pour vérifier si la modal doit être affichée
  const checkModalVisibility = (streak: number) => {
    const _now = new Date();
    const lastUpdated = localStorage.getItem(STREAK_LAST_UPDATED_KEY);

    // Ne pas afficher si pas de mise à jour aujourd'hui (pas de nouvelle connexion)
    if (!lastUpdated) {
      setShouldShowModal(false);
      return;
    }

    const lastUpdate = new Date(lastUpdated);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastUpdateDay = new Date(lastUpdate);
    lastUpdateDay.setHours(0, 0, 0, 0);

    // Afficher seulement si :
    // 1. Mise à jour aujourd'hui (nouvelle connexion)
    // 2. Streak > 0
    const isToday = lastUpdateDay.getTime() === today.getTime();
    
    if (isToday && streak > 0) {
      setShouldShowModal(true);
    } else {
      setShouldShowModal(false);
    }
  };

  // Au montage, vérifier le cache localStorage et décider si faire une requête
  useEffect(() => {
    const lastUpdated = localStorage.getItem(STREAK_LAST_UPDATED_KEY);

    if (lastUpdated) {
      const lastUpdate = new Date(lastUpdated);
      // Créer les jours calendaires en UTC pour la comparaison
      const todayUTC = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
      const lastUpdateUTC = new Date(Date.UTC(lastUpdate.getUTCFullYear(), lastUpdate.getUTCMonth(), lastUpdate.getUTCDate()));

      // Vérifier si c'est un nouveau jour calendaire
      const isNewDay = lastUpdateUTC.getTime() !== todayUTC.getTime();

      if (isNewDay) {
        // Nouveau jour, faire une requête pour mettre à jour la streak
        createStreakMutation.mutate();
      } else {
        // Même jour, pas de requête (la streak vient de /profile/self)
        // On ne met pas de valeur ici, elle viendra du endpoint profile
        setCurrentStreak(0); // Valeur temporaire, sera remplacée par /profile/self
        setShouldShowModal(false); // Pas de modal le même jour
      }
    } else {
      // Pas de cache, faire une requête
      createStreakMutation.mutate();
    }
  }, []);

  // Fonction pour fermer la modal
  const markModalAsShown = () => {
    setShouldShowModal(false);
  };

  return {
    currentStreak,
    shouldShowModal,
    markModalAsShown,
    isLoading: createStreakMutation.isPending,
    error: createStreakMutation.error,
  };
};
