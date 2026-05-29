import { useEffect, useState } from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";

interface StreakModalProps {
  streak: number;
  onClose: () => void;
}

export const StreakModal = ({ streak, onClose }: StreakModalProps) => {
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    let animationFrame: number;

    if (currentStreak < streak) {
      animationFrame = requestAnimationFrame(() => {
        setCurrentStreak((prev) => Math.min(prev + 1, streak));
      });
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [currentStreak, streak]);

  return (
    <AriaDialogTrigger isOpen={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full max-w-120 overflow-hidden rounded-2xl bg-primary shadow-xl">
              <div className="flex flex-col items-center gap-5 px-4 py-6 text-center md:px-6 md:pt-8">
                <div className="text-4xl font-extrabold text-[#5E6AD2] mt-4">
                  🔥 {currentStreak} jours
                </div>
                <AriaHeading slot="title" className="text-md font-semibold text-primary md:text-lg">
                  Félicitations !
                </AriaHeading>
                <p className="mt-2 text-sm text-tertiary">
                  Continuez comme ça pour battre votre record !
                </p>
              </div>
              <div className="flex flex-col px-4 pb-8 md:px-6">
                <button
                  onClick={onClose}
                  className="mt-6 px-4 py-2 bg-[#5E6AD2] text-white rounded hover:bg-[#4A5BC0] transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};
