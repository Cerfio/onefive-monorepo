'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Copy, CheckCircle2 } from 'lucide-react';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface WaitlistBannerProps {
  /** Show detailed info (position, referral code, etc.) */
  showDetails?: boolean;
  /** Custom message to display */
  message?: string;
  /** Custom className */
  className?: string;
}

/**
 * Banner displayed to users with WAITING waitlist status.
 * Explains why they can't perform certain actions and how to get activated.
 */
export function WaitlistBanner({
  showDetails = false,
  message,
  className,
}: WaitlistBannerProps) {
  const { isWaiting, position, referralCode, foundingMember, isLoading } =
    useWaitlistStatus();
  const [copied, setCopied] = useState(false);

  // Don't render if user is active or still loading
  if (isLoading || !isWaiting) {
    return null;
  }

  const copyReferralLink = () => {
    if (referralCode) {
      const link = `${window.location.origin}/signup?ref=${referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Lien de parrainage copié !');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Alert
      className={`bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 ${className || ''}`}
    >
      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Vous êtes sur liste d'attente
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <p>
          {message ||
            'Vérifiez votre email pour activer votre compte et accéder à toutes les fonctionnalités.'}
        </p>

        {showDetails && (
          <div className="mt-3 space-y-2">
            {position && (
              <p className="text-sm">
                <strong>Position :</strong> #{position}
              </p>
            )}

            {foundingMember && (
              <p className="text-sm">
                <strong>Founding Member :</strong>{' '}
                {foundingMember.unlocked
                  ? '✅ Débloqué !'
                  : `${foundingMember.progress}/${foundingMember.threshold} parrainages`}
              </p>
            )}

            {referralCode && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">
                  <strong>Code parrainage :</strong> {referralCode}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralLink}
                  className="h-7 px-2 text-xs"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}

            <p className="text-xs mt-2 text-amber-600 dark:text-amber-400">
              Parrainez 10 amis pour devenir Founding Member et être activé
              automatiquement !
            </p>
          </div>
        )}

        <div className="mt-3">
          <Link href="/waitlist">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
            >
              En savoir plus
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Compact inline message for WAITING users.
 * Used in modals or small spaces.
 */
export function WaitlistInlineMessage({ className }: { className?: string }) {
  const { isWaiting, isLoading } = useWaitlistStatus();

  if (isLoading || !isWaiting) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 ${className || ''}`}
    >
      <Clock className="h-4 w-4" />
      <span>
        Vous êtes sur liste d'attente.{' '}
        <Link href="/waitlist" className="underline hover:no-underline">
          En savoir plus
        </Link>
      </span>
    </div>
  );
}

export default WaitlistBanner;
