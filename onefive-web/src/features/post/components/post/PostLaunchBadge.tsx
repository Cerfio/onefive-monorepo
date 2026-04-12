import { memo } from 'react';
import Link from 'next/link';
import { ExternalLink, Rocket } from 'lucide-react';
import { BuildInPublicData } from '@/components/feed/BuildInPublicPost';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';

interface PostLaunchBadgeProps {
  buildInPublicData?: BuildInPublicData;
  className?: string;
}

const PostLaunchBadge: React.FC<PostLaunchBadgeProps> = ({ 
  buildInPublicData, 
  className = '' 
}) => {
  if (!buildInPublicData?.launch) return null;

  const { launch, projectName } = buildInPublicData;
  const launchUrl = launch.productUrl || (launch.productId ? `/products/${launch.productId}` : null);
  const tooltipText = `Lancement : ${launch.product}${projectName ? ` • ${projectName}` : ''}`;

  const badgeContent = (
    <>
      {launch.productLogo ? (
        <div className="relative w-4 h-4 rounded overflow-hidden bg-white/20 flex-shrink-0">
          <img
            src={launch.productLogo}
            alt={`${launch.product} logo`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>';
              }
            }}
          />
        </div>
      ) : (
        <Rocket className="w-3 h-3 flex-shrink-0" />
      )}
      <span className="font-semibold">{launch.product}</span>
      {launch.productUrl && (
        <ExternalLink className="w-3 h-3 opacity-70 flex-shrink-0" />
      )}
    </>
  );

  return (
    <Tooltip title={tooltipText}>
      <TooltipTrigger>
        {launchUrl ? (
          <Link
            href={launchUrl}
            target={launch.productUrl ? '_blank' : undefined}
            rel={launch.productUrl ? 'noopener noreferrer' : undefined}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-all duration-200 hover:shadow-md bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6] hover:from-[#4E5AC2] hover:to-[#7B4CE6] text-white border-transparent ${className}`}
          >
            {badgeContent}
          </Link>
        ) : (
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6] text-white border-transparent cursor-pointer ${className}`}>
            {badgeContent}
          </div>
        )}
      </TooltipTrigger>
    </Tooltip>
  );
};

export default memo(PostLaunchBadge);

