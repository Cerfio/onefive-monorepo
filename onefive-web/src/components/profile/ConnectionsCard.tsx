'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Button } from '../base/buttons/button';
import { Avatar } from '../base/avatar/avatar';
import { MessageCircle } from 'lucide-react';

export const ConnectionsCard = ({ profileData }: { profileData: any }) => {
    return (
        <Card>
            <CardHeader><CardTitle>Connexions</CardTitle></CardHeader>
            <CardContent>
                {profileData.connectionsData.map((conn: any) => (
                    <div key={conn.id} className="flex gap-3 items-center mb-4">
                    <div className="h-10 w-10 rounded-full flex-shrink-0"><Avatar src={conn.avatar} /></div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm text-[#101828]">{conn.name}</p>
                        <p className="text-xs text-gray-500">{conn.mutual} connexions en commun</p>
                    </div>
                    <Button size="sm" color="secondary"><MessageCircle size={14} /></Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}; 