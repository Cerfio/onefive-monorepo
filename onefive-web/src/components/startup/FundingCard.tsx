'use client';

import { useState } from 'react';
import { DollarSign, Users, FileText, Calendar, Plus, Trash2, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/ui/button';
import { Button as BaseButton } from '@/components/base/buttons/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FundingData, FundingHistoryEntry, parseInvestors } from '@/queries/startup';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserMiniProfile } from '@/components/base/avatar/user-mini-profile';
import { resolveAvatarUrl } from '@/utils/avatar';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

const ROUND_LABELS: Record<FundingHistoryEntry['round'], string> = {
  LOVE_MONEY: 'Love Money',
  PRESEED: 'Preseed',
  SEED: 'Seed',
  SERIESA: 'Série A',
  SERIESB: 'Série B',
  SERIESC: 'Série C',
  SERIESD: 'Série D',
  BRIDGE: 'Bridge',
  VENTUREDEBT: 'Venture Debt',
  OTHER: 'Autre',
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M€`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K€`;
  }
  return `${amount}€`;
};

export const FundingCard = ({ 
  funding, 
  history = [],
  currentUser = false, 
  onAddHistory,
  onEditHistory,
  onDeleteHistory,
}: {
  funding: FundingData;
  history?: FundingHistoryEntry[];
  currentUser?: boolean;
  onAddHistory?: () => void;
  onEditHistory?: (entry: FundingHistoryEntry) => void;
  onDeleteHistory?: (entryId: string) => void;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<FundingHistoryEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { navigateToConversation } = useNavigateToConversation();

  // Calculer le total levé depuis l'historique
  const calculatedTotal = history.reduce((sum, entry) => sum + entry.amountRaised, 0);
  const hasHistory = history.length > 0;
  
  // Parser les investisseurs pour obtenir la structure enrichie
  const investors = parseInvestors(funding.investors || []);

  const handleDeleteClick = (entry: FundingHistoryEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (entryToDelete && onDeleteHistory) {
      setIsDeleting(true);
      try {
        await onDeleteHistory(entryToDelete.id);
        setDeleteDialogOpen(false);
        setEntryToDelete(null);
      } catch (error) {
        console.error('Error deleting funding history:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Financement</h3>
      </div>

      <div className="space-y-4">
        {/* Total levé - calculé automatiquement depuis l'historique */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total levé</span>
          {hasHistory ? (
            <span className="font-bold text-green-600">{formatCurrency(calculatedTotal)}</span>
          ) : (
            <span className="text-gray-500 italic">Aucun investissement</span>
          )}
        </div>
        
        {funding.lastRound && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Dernière levée</span>
            <Badge type="badge-modern" color="gray" size="sm">{funding.lastRound}</Badge>
          </div>
        )}
        
        {investors.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Investisseurs
            </h4>
            <div className="space-y-2">
              {investors.map((investor) => (
                <div key={investor.id} className="flex items-center gap-2">
                  {investor.type === 'profile' ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={resolveAvatarUrl(investor.avatar)} />
                        <AvatarFallback>{investor.name[0]}</AvatarFallback>
                      </Avatar>
                      <Link 
                        href={`/profile/${investor.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline cursor-pointer flex-1"
                      >
                        {investor.name}
                      </Link>
                      <Badge type="pill-color" color="gray" size="sm">OneFive</Badge>
                    </>
                  ) : (
                    <>
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="text-sm font-medium flex-1">{investor.name}</span>
                      <Badge type="badge-modern" color="gray" size="sm">Invité</Badge>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique des financements */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Historique
            </h4>
            {currentUser && onAddHistory && (
              <Button variant="ghost" size="sm" onClick={onAddHistory}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          {hasHistory ? (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-lg space-y-2 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge type="badge-modern" color="gray" size="sm">{ROUND_LABELS[entry.round]}</Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(entry.date), 'd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(entry.amountRaised)}
                        {entry.valuation && (
                          <span className="text-gray-500 font-normal ml-2">
                            · Valo: {formatCurrency(entry.valuation)}
                          </span>
                        )}
                      </div>
                      {entry.instrument && (
                        <div className="text-xs text-gray-500 mt-1">
                          Instrument: {
                            entry.instrument === 'BSA_AIR' ? 'BSA AIR' :
                            entry.instrument === 'CONVERTIBLE_NOTE' ? 'Obligations Convertibles' :
                            entry.instrument === 'EQUITY' ? 'Actions (Equity)' :
                            entry.instrument === 'SAFE' ? 'SAFE' :
                            entry.instrument // Pour "OTHER" ou tout autre custom, afficher tel quel
                          }
                        </div>
                      )}
                    </div>
                    {/* Boutons d'action - visibles au hover */}
                    {currentUser && (onEditHistory || onDeleteHistory) && (
                      <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEditHistory && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditHistory(entry)}
                            className="h-7 w-7 p-0 hover:bg-gray-200"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onDeleteHistory && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(entry)}
                            className="h-7 w-7 p-0 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Investisseurs de cette levée */}
                  {entry.investors && entry.investors.length > 0 && (() => {
                    const visibleInvestors = entry.investors.filter((inv: any) => {
                      if (inv.invitationStatus === 'DECLINED') return false;
                      if (inv.invitationStatus === 'ACCEPTED' && inv.isVisible === false) return false;
                      return true;
                    });
                    const anonymousCount = entry.investors.filter(
                      (inv: any) => inv.invitationStatus === 'ACCEPTED' && inv.isVisible === false,
                    ).length;
                    if (visibleInvestors.length === 0 && anonymousCount === 0) return null;
                    return (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600">
                        Investisseurs ({visibleInvestors.length + anonymousCount})
                      </p>
                      <div className="space-y-1.5">
                        {visibleInvestors.map((investor: any) => {
                          const isOneFiveProfile = investor.type === 'person' && investor.id && !investor.id.startsWith('manual-');
                          const isPending = investor.invitationStatus === 'PENDING';
                          
                          const displayName = investor.firstName && investor.lastName
                            ? `${investor.firstName} ${investor.lastName}`
                            : investor.name;
                          
                          return (
                            <div key={investor.id} className="flex items-center gap-2">
                              {isOneFiveProfile && !isPending ? (
                                <div className="flex-1">
                                  <UserMiniProfile
                                    profileId={investor.id}
                                    firstName={investor.firstName || displayName.split(' ')[0] || ''}
                                    lastName={
                                      investor.lastName ||
                                      displayName.split(' ').slice(1).join(' ')
                                    }
                                    avatar={resolveAvatarUrl(investor.avatar) || ''}
                                    highlight={investor.highlight || undefined}
                                    bio={investor.bio || undefined}
                                    ecosystemRoles={investor.ecosystemRoles}
                                    countryCode={investor.countryCode}
                                    size="sm"
                                    onMessage={() => navigateToConversation(investor.id)}
                                  />
                                </div>
                              ) : (
                                <>
                                  <div className="h-6 w-6 rounded-md bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {investor.logo ? (
                                      <img src={investor.logo} alt={displayName} className="w-4 h-4 object-contain" />
                                    ) : investor.type === 'person' ? (
                                      <span className="text-xs">{displayName[0]}</span>
                                    ) : (
                                      <span className="text-xs">🏢</span>
                                    )}
                                  </div>
                                  {investor.website ? (
                                    <a 
                                      href={investor.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-medium text-blue-600 hover:underline flex-1"
                                    >
                                      {displayName}
                                    </a>
                                  ) : (
                                    <span className="text-xs font-medium flex-1">{displayName}</span>
                                  )}
                                  <Badge type="badge-modern" color="gray" size="sm" className="text-[10px] px-1.5 py-0">
                                    Pas sur OneFive
                                  </Badge>
                                </>
                              )}
                              {isPending && (
                                <Badge type="badge-modern" color="warning" size="sm" className="text-[10px] px-1.5 py-0">
                                  En attente
                                </Badge>
                              )}
                              {entry.leadInvestor === investor.id && (
                                <Badge type="pill-color" color="warning" size="sm" className="text-[10px] px-1.5 py-0">
                                  Lead
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                        {anonymousCount > 0 && (
                          <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                            <span>+ {anonymousCount} investisseur{anonymousCount > 1 ? 's' : ''} anonyme{anonymousCount > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })()}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-100 italic">
                      {entry.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">Aucun financement enregistré</p>
              {currentUser && onAddHistory && (
                <BaseButton 
                  color="primary"
                  size="sm"
                  onClick={onAddHistory}
                  iconLeading={Plus}
                >
                  Ajouter votre première levée
                </BaseButton>
              )}
            </div>
          )}
        </div>

        {/* Section investissement */}
        {funding.fundraisingType && funding.fundraisingType !== 'none' && (
          <div className="pt-4 border-t border-gray-100">
            {funding.fundraisingType === 'structured' && funding.structuredRound && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge type="pill-color" color="warning" size="sm">
                    💸 Levée en cours
                  </Badge>
                  <Badge type="badge-modern" color="gray" size="sm">
                    {funding.structuredRound.instrument}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant recherché</span>
                    <span className="font-medium">{funding.structuredRound.targetAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket minimum</span>
                    <span className="font-medium">{funding.structuredRound.minTicket}</span>
                  </div>
                  {funding.structuredRound.cap && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cap</span>
                      <span className="font-medium">{funding.structuredRound.cap}</span>
                    </div>
                  )}
                  {funding.structuredRound.discount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium">{funding.structuredRound.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium">{funding.structuredRound.deadline}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {funding.structuredRound.deckUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={funding.structuredRound.deckUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-1" />
                        Voir le deck
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {funding.fundraisingType === 'rolling' && funding.rollingInvestment && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge type="pill-color" color="success" size="sm">
                    🟢 Accepte les investissements
                  </Badge>
                  <Badge type="badge-modern" color="gray" size="sm">
                    {funding.rollingInvestment.instrument}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  {funding.rollingInvestment.cap && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cap proposé</span>
                      <span className="font-medium">{funding.rollingInvestment.cap}</span>
                    </div>
                  )}
                  {funding.rollingInvestment.discount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium">{funding.rollingInvestment.discount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {entryToDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce financement ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le financement{' '}
                <strong>{ROUND_LABELS[entryToDelete.round]}</strong> du{' '}
                {format(new Date(entryToDelete.date), 'd MMMM yyyy', { locale: fr })}{' '}
                ({formatCurrency(entryToDelete.amountRaised)}) sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
};
