'use client';

import { Users, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/base/buttons/button';

export const FoundersCard = ({ founders }: {
  founders: any[];
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Fondateurs</h3>
      </div>

      <div className="space-y-4">
        {founders.map((founder) => (
          <div key={founder.id} className="flex items-center gap-3">
            <img 
              src={founder.avatar} 
              alt={founder.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{founder.name}</h4>
              <p className="text-sm text-gray-500">{founder.role}</p>
            </div>
            <Button
              size="sm"
              color="secondary"
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              iconLeading={<ExternalLink data-icon />}
            />

          </div>
        ))}
      </div>
    </Card>
  );
}; 