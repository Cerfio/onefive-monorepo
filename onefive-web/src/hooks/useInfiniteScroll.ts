import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

export const useInfiniteScroll = (
  onTrigger: () => void,
  hasNextPage: boolean,
  isFetching: boolean,
  margin: string = '100px',
) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: margin,
  });

  // Déclenche UNE seule fois par passage du sentinel dans le viewport.
  // Le verrou n'est relâché que lorsque le sentinel RESSORT de l'écran
  // (inView repasse à false) : il faut donc re-scroller jusqu'en bas pour
  // charger la page suivante, au lieu d'un enchaînement automatique continu
  // tant qu'on reste en bas. Bonus : un fetch qui échoue (ex. 429) ne
  // re-déclenche pas en boucle — aucune rafale possible.
  const triggered = useRef(false);

  useEffect(() => {
    if (!inView) {
      // Sentinel hors écran → réarme pour le prochain scroll vers le bas.
      triggered.current = false;
      return;
    }
    if (!triggered.current && hasNextPage && !isFetching) {
      triggered.current = true;
      onTrigger();
    }
  }, [inView, hasNextPage, isFetching, onTrigger]);

  return ref;
};
