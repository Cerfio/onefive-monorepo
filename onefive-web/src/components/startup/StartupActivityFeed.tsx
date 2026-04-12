'use client';

import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { decodeBuildInPublicData, hasBuildInPublicData } from '@/utils/buildInPublic';
import ProjectAvatar from '@/features/post/components/post/ProjectAvatar';
import PostTypeBadge from '@/features/post/components/post/PostTypeBadge';
import Link from 'next/link';

export const StartupActivityFeed = ({ posts }: {
  posts: any[];
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
      
      {posts.map((post) => {
        const { visibleContent, buildInPublicData } = decodeBuildInPublicData(post.content || '');
        const isBuildInPublic = hasBuildInPublicData(post.content || '');
        return (
        <Card key={post.id} className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                <span className="text-sm text-gray-500">{post.author.role}</span>
              </div>
              <p className="text-sm text-gray-500">Il y a {post.createdAt}</p>
            </div>
          </div>
          
          {/* Header avec badges en haut à droite */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <p className="text-gray-800 flex-1">{visibleContent || post.content}</p>
            {/* Badge du projet et type pour les posts Build in Public - en haut à droite */}
            {isBuildInPublic && buildInPublicData && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {buildInPublicData.projectId || buildInPublicData.projectName ? (
                  buildInPublicData.projectId ? (
                    <Link 
                      href={`/startups/${buildInPublicData.projectId}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <ProjectAvatar 
                        projectId={buildInPublicData.projectId}
                        projectName={buildInPublicData.projectName}
                        size="sm"
                      />
                      <span className="font-medium">{buildInPublicData.projectName}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                      <ProjectAvatar 
                        projectId={buildInPublicData.projectId || ''}
                        projectName={buildInPublicData.projectName}
                        size="sm"
                      />
                      <span className="font-medium">{buildInPublicData.projectName}</span>
                    </div>
                  )
                ) : null}
                {buildInPublicData.type && (
                  <PostTypeBadge buildInPublicData={buildInPublicData} />
                )}
              </div>
            )}
          </div>
          
          {post.image && (
            <img 
              src={post.image} 
              alt="Post image"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              {post.likes}
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              {post.comments}
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </Card>
        );
      })}
    </div>
  );
}; 