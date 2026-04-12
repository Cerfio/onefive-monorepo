import { useEffect } from 'react';
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

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      onTrigger();
    }
  }, [inView, hasNextPage, isFetching, onTrigger]);

  return ref;
};
