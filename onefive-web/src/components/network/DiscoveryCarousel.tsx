import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { ChevronLeft, ChevronRight, Rocket, Star, MapPin, Target, Briefcase } from 'lucide-react';
import { formatLocationDisplay } from '@/lib/country';

interface DiscoverySection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: any[];
  type: 'people' | 'startups' | 'insights';
  priority: 'high' | 'medium' | 'low';
}

interface DiscoveryCarouselProps {
  section: DiscoverySection;
  onItemClick?: (item: any) => void;
  onSeeAll?: () => void;
}

const DiscoveryCarousel: React.FC<DiscoveryCarouselProps> = ({
  section,
  onItemClick: _onItemClick,
  onSeeAll
}) => {
  const scrollContainer = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 320;
      const currentScroll = scrollContainer.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainer.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const renderItem = (item: any, _index: number) => {
    if (section.type === 'people') {
      return (
        <div key={item.id} className="flex-shrink-0 w-[280px]">
          <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {item.firstname[0]}{item.lastname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.firstname} {item.lastname}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{item.highlight}</p>
                </div>
                {item.badges && item.badges.map((badge: string, i: number) => (
                  <Badge key={i} type="pill-color" color="gray" size="sm">
                    {badge}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{formatLocationDisplay(item.location)}</span>
                </div>
                {item.activeGoal && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Target className="h-3 w-3" />
                    <span className="truncate">{item.activeGoal}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-3 w-3" />
                  <span className="truncate">{item.industry?.join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Se connecter
                  </Button>
                  <Button size="sm" color="secondary">
                    Suivre
                  </Button>
                </div>
                {item.matchScore && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Match</div>
                    <div className="text-sm font-semibold text-green-600">{item.matchScore}%</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (section.type === 'startups') {
      return (
        <div key={item.id} className="flex-shrink-0 w-[280px]">
          <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{item.tagline || item.tags?.join(', ')}</p>
                </div>
                {item.isHiring && (
                  <Badge type="pill-color" color="success" size="sm">
                    Recrute
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{formatLocationDisplay(item.location)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge type="badge-modern" color="gray" size="sm">
                    {item.stage}
                  </Badge>
                  <span className="text-xs text-gray-500">{item.employees} employés</span>
                </div>
                {item.lastFunding && (
                  <div className="text-xs text-green-600">
                    Dernière levée: {item.lastFunding}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Suivre
                  </Button>
                  <Button size="sm" color="secondary">
                    Voir jobs
                  </Button>
                </div>
                {item.trendingScore && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Trending</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-semibold">{item.trendingScore}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            section.priority === 'high' 
              ? 'bg-blue-100 text-blue-600' 
              : section.priority === 'medium'
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {section.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
            <p className="text-sm text-gray-600">{section.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={() => scroll('left')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={() => scroll('right')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button color="secondary" size="sm" onClick={onSeeAll}>
            Voir tout
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainer}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {section.items.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
};

export default DiscoveryCarousel; 