'use client';

import { useStreak } from '@/hooks/useStreak';
import { StreakModal } from '@/components/StreakModal';

const StreakProvider = ({ children }: { children: React.ReactNode }) => {
  const { shouldShowModal, currentStreak, markModalAsShown } = useStreak();

  return (
    <>
      {children}
      {shouldShowModal && (
        <StreakModal
          streak={currentStreak}
          onClose={markModalAsShown}
        />
      )}
    </>
  );
};

export default StreakProvider;
