import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingPostIndicatorProps {
	className?: string;
	label?: string;
}

export const PendingPostIndicator: React.FC<PendingPostIndicatorProps> = ({
	className,
	label = "Publication en cours...",
}) => {
	return (
		<div
			className={cn(
				'flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-muted/40',
				className,
			)}
		>
			<Loader2 className="h-4 w-4 animate-spin" />
			{label}
		</div>
	);
};
