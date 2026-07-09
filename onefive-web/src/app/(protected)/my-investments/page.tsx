'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import { Card, CardContent } from '@/components/base/card/card';
import { Badge } from '@/components/base/badges/badges';
import { Toggle } from '@/components/base/toggle/toggle';
import {
  useMyInvestments,
  useToggleInvestorVisibility,
  useAcceptInvestorInvitation,
  useDeclineInvestorInvitation,
  type MyInvestment,
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

const STATUS_CONFIG = {
  PENDING: {
    label: 'En attente',
    color: 'warning' as const,
  },
  ACCEPTED: {
    label: 'Accepté',
    color: 'success' as const,
  },
  DECLINED: {
    label: 'Refusé',
    color: 'error' as const,
  },
};

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M€`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k€`;
  return `${amount}€`;
}

function sumAmount(items: MyInvestment[]): number {
  return items.reduce((s, i) => s + (i.fundingHistory?.amountRaised || 0), 0);
}

function InvestmentCard({ investment }: { investment: MyInvestment }) {
  const router = useRouter();
  const toggleVisibility = useToggleInvestorVisibility();
  const acceptMutation = useAcceptInvestorInvitation();
  const declineMutation = useDeclineInvestorInvitation();
  const [optimisticVisible, setOptimisticVisible] = useState(
    investment.isVisible,
  );

  const status = STATUS_CONFIG[investment.invitationStatus];
  const isPending = investment.invitationStatus === 'PENDING';
  const isAccepted = investment.invitationStatus === 'ACCEPTED';

  const handleToggleVisibility = () => {
    const newVal = !optimisticVisible;
    setOptimisticVisible(newVal);
    toggleVisibility.mutate(
      { invitationId: investment.id, isVisible: newVal },
      {
        onError: () => setOptimisticVisible(!newVal),
      },
    );
  };

  const handleAccept = () => {
    acceptMutation.mutate(investment.id);
  };

  const handleDecline = () => {
    declineMutation.mutate(investment.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo startup */}
          <div
            className="w-12 h-12 shrink-0 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => router.push(`/startup/${investment.startup.id}`)}
          >
            {investment.startup.logo ? (
              <img
                src={investment.startup.logo}
                alt={investment.startup.name}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Building2 className="text-gray-400" size={20} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="font-semibold text-gray-900 cursor-pointer hover:text-violet-600 transition-colors"
                onClick={() =>
                  router.push(`/startup/${investment.startup.id}`)
                }
              >
                {investment.startup.name}
              </h3>
              <Badge type="pill-color" color={status.color} size="sm">
                {status.label}
              </Badge>
              {investment.isLead && (
                <Badge type="pill-color" color="purple" size="sm">
                  Lead
                </Badge>
              )}
            </div>

            {/* Tagline */}
            {investment.startup.tagline && (
              <p className="text-sm text-gray-500 truncate mb-2">
                {investment.startup.tagline}
              </p>
            )}

            {/* Details */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <TrendingUp size={12} />
                {ROUND_LABELS[investment.fundingHistory.round] ||
                  investment.fundingHistory.round}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(
                  investment.fundingHistory.date,
                ).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
              <span>{formatAmount(investment.fundingHistory.amountRaised)}</span>
            </div>

            {/* Docs liés : data room accessible */}
            {investment.dataroom && (
              <button
                onClick={() => router.push(`/dataroom/${investment.dataroom!.id}`)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                <FolderOpen size={13} />
                Voir la data room
              </button>
            )}

            {/* Actions */}
            {isPending && (
              <div className="flex gap-2 mt-3">
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleAccept}
                  isDisabled={
                    acceptMutation.isPending || declineMutation.isPending
                  }
                  iconLeading={acceptMutation.isPending ? <Loader2 data-icon className="animate-spin" /> : <Check data-icon />}
                >
                  Accepter
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={handleDecline}
                  isDisabled={
                    acceptMutation.isPending || declineMutation.isPending
                  }
                  iconLeading={declineMutation.isPending ? <Loader2 data-icon className="animate-spin" /> : <X data-icon />}
                >
                  Refuser
                </Button>
              </div>
            )}

            {/* Visibility toggle */}
            {isAccepted && (
              <div className="flex items-center gap-2 mt-3">
                <Toggle
                  isSelected={optimisticVisible}
                  onChange={handleToggleVisibility}
                  isDisabled={toggleVisibility.isPending}
                />
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  {optimisticVisible ? (
                    <>
                      <Eye size={14} className="text-green-500" />
                      Visible publiquement
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} className="text-gray-400" />
                      Anonyme
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyInvestmentsPage() {
  const router = useRouter();
  const { data: investments, isLoading } = useMyInvestments();

  const pending = investments?.filter((i) => i.invitationStatus === 'PENDING') || [];
  const accepted = investments?.filter((i) => i.invitationStatus === 'ACCEPTED') || [];
  const declined = investments?.filter((i) => i.invitationStatus === 'DECLINED') || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button
          color="tertiary"
          size="sm"
          onClick={() => router.back()}
          iconLeading={<ArrowLeft data-icon />}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mes investissements
          </h1>
          <p className="text-sm text-gray-500">
            Gérez vos participations et votre visibilité
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : !investments || investments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="mx-auto mb-4 text-gray-300" size={48} />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun investissement
            </h2>
            <p className="text-sm text-gray-500">
              Vous n&apos;avez pas encore été ajouté comme investisseur sur une
              startup.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Résumé des montants par statut */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Acceptés', items: accepted, color: 'text-green-600' },
              { label: 'En attente', items: pending, color: 'text-amber-600' },
              { label: 'Refusés', items: declined, color: 'text-gray-500' },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.items.length}</p>
                  {s.items.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatAmount(sumAmount(s.items))} levés
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending invitations */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                En attente ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((inv) => (
                  <InvestmentCard key={inv.id} investment={inv} />
                ))}
              </div>
            </div>
          )}

          {/* Accepted */}
          {accepted.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Acceptés ({accepted.length})
              </h2>
              <div className="space-y-3">
                {accepted.map((inv) => (
                  <InvestmentCard key={inv.id} investment={inv} />
                ))}
              </div>
            </div>
          )}

          {/* Declined */}
          {declined.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Refusés ({declined.length})
              </h2>
              <div className="space-y-3">
                {declined.map((inv) => (
                  <InvestmentCard key={inv.id} investment={inv} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
