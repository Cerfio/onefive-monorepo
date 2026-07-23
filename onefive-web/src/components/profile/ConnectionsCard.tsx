'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Button } from '../base/buttons/button';
import { Avatar } from '../base/avatar/avatar';
import { MessageCircle } from 'lucide-react';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

export const ConnectionsCard = ({ profileData }: { profileData: any }) => {
    const { navigateToConversation, loadingProfileId } = useNavigateToConversation();
    const connections = profileData.connectionsData ?? [];
    const mutualMode = !!profileData.mutualMode;
    const title = mutualMode ? 'Connexions en commun' : 'Connexions';
    const emptyLabel = mutualMode
        ? 'Aucune connexion en commun.'
        : 'Aucune connexion pour le moment.';
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}{connections.length > 0 ? ` (${connections.length})` : ''}</CardTitle>
            </CardHeader>
            <CardContent>
                {connections.length === 0 ? (
                    <p className="text-sm text-gray-500">{emptyLabel}</p>
                ) : (
                    connections.map((conn: any) => (
                        <div key={conn.id} className="flex gap-3 items-center mb-4">
                            <div className="h-10 w-10 rounded-full flex-shrink-0"><Avatar src={conn.avatar} /></div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-[#101828]">{conn.name}</p>
                                {typeof conn.mutual === 'number' && (
                                    <p className="text-xs text-gray-500">{conn.mutual} connexions en commun</p>
                                )}
                            </div>
                            <Button
                                size="sm"
                                color="secondary"
                                onClick={() => navigateToConversation(conn.id)}
                                isDisabled={!conn.id || loadingProfileId === conn.id}
                            >
                                <MessageCircle size={14} />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}; 