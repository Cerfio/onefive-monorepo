'use client';

import { Plus, Clock } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import { tags } from '@/constant';
import { Tags } from '@/enums';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DiscussionHeaderProps {
  topic?: Tags;
  onOpenCreateModal: () => void;
}

export const DiscussionHeader = ({ topic, onOpenCreateModal }: DiscussionHeaderProps) => {
  const { isWaiting } = useWaitlistStatus();

  const createButton = (
    <Button
      size="lg"
      onClick={isWaiting ? undefined : onOpenCreateModal}
      isDisabled={isWaiting}
      iconLeading={isWaiting ? <Clock data-icon /> : <Plus data-icon />}
    >
      Nouvelle discussion
    </Button>
  );

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[#101828]">
              Discussions{' '}
              {`${
                tags.find((tag) => tag.enum === topic) !== undefined
                  ? `• ${tags.find((tag) => tag.enum === topic)?.title}`
                  : ''
              }`}
            </h1>
            <p className="text-[#475467] mt-1">
              Posez des questions, trouvez du support et connectez-vous avec la communauté
            </p>
          </div>
          <div>
            {isWaiting ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>{createButton}</TooltipTrigger>
                  <TooltipContent>
                    <p>Vérifiez votre email pour activer votre compte</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              createButton
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 