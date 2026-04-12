'use client';

import { Card, CardContent } from '@/components/ui/card';

export const ActivityFeed = ({ profileData }: { profileData: any }) => {
  if (!profileData.posts || profileData.posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {profileData.posts.map((post: any) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            {/* TODO: intégrer les données de posts quand l'API sera disponible */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
