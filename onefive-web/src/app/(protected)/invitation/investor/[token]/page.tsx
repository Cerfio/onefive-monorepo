'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Building2, Check, X, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useInvestorInvitationByToken,
  useAcceptInvestorInvitationByToken,
  useDeclineInvestorInvitationByToken,
} from '@/queries/startup';

const ROUND_LABELS: Record<string, string> = {
  LOVE_MONEY: 'Love Money',
  PRESEED: 'Pré-Seed',
  SEED: 'Seed',
  SERIESA: 'Série A',
  SERIESB: 'Série B',
  SERIESC: 'Série C',
  SERIESD: 'Série D',
  BRIDGE: 'Bridge',
  VENTUREDEBT: 'Venture Debt',
  OTHER: 'Autre',
};

export default function InvestorInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [responded, setResponded] = useState(false);

  const { data: invitation, isLoading, error } = useInvestorInvitationByToken(token);
  const acceptMutation = useAcceptInvestorInvitationByToken();
  const declineMutation = useDeclineInvestorInvitationByToken();

  const handleAccept = async () => {
    await acceptMutation.mutateAsync(token);
    setResponded(true);
  };

  const handleDecline = async () => {
    await declineMutation.mutateAsync(token);
    setResponded(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="max-w-lg mx-auto mt-20 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Invitation introuvable
            </h2>
            <p className="text-sm text-gray-500">
              Cette invitation n&apos;existe pas ou a été supprimée.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push('/feed')}
            >
              Retour à l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.isExpired) {
    return (
      <div className="max-w-lg mx-auto mt-20 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="mx-auto mb-4 text-orange-400" size={48} />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Invitation expirée
            </h2>
            <p className="text-sm text-gray-500">
              Cette invitation a expiré. Contactez la startup pour obtenir une nouvelle invitation.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push('/feed')}
            >
              Retour à l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.invitationStatus !== 'PENDING' || responded) {
    const isAccepted =
      invitation.invitationStatus === 'ACCEPTED' ||
      (responded && acceptMutation.isSuccess);

    return (
      <div className="max-w-lg mx-auto mt-20 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            {isAccepted ? (
              <>
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="text-green-600" size={24} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Invitation acceptée
                </h2>
                <p className="text-sm text-gray-500">
                  Vous êtes maintenant listé comme investisseur de{' '}
                  <strong>{invitation.startup.name}</strong>.
                  Vous pouvez gérer votre visibilité depuis vos investissements.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="text-gray-600" size={24} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Invitation refusée
                </h2>
                <p className="text-sm text-gray-500">
                  Vous avez refusé l&apos;invitation de{' '}
                  <strong>{invitation.startup.name}</strong>.
                </p>
              </>
            )}
            <Button
              className="mt-6"
              onClick={() => router.push('/feed')}
            >
              Retour à l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-20 px-4">
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center overflow-hidden">
              {invitation.startup.logo ? (
                <img
                  src={invitation.startup.logo}
                  alt={invitation.startup.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <Building2 className="text-violet-400" size={28} />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Invitation investisseur
            </h2>
            <p className="text-sm text-gray-600">
              <strong>{invitation.startup.name}</strong> vous a ajouté comme
              investisseur pour sa levée{' '}
              <strong>{ROUND_LABELS[invitation.fundingRound] || invitation.fundingRound}</strong>
              {' '}de{' '}
              {new Date(invitation.fundingDate).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
              })}
              .
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
              En acceptant, vous confirmez :
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Avoir investi dans {invitation.startup.name}</li>
              <li>• Votre nom apparaîtra publiquement (modifiable)</li>
              <li>• Vous pourrez basculer en anonyme à tout moment</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleDecline}
              disabled={declineMutation.isPending || acceptMutation.isPending}
            >
              {declineMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <X className="mr-2" size={16} />
              )}
              Refuser
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={acceptMutation.isPending || declineMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Check className="mr-2" size={16} />
              )}
              Accepter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
