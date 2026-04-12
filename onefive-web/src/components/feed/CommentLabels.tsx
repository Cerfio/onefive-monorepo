'use client';

import { Badge } from '@/components/base/badges/badges';
import { MessageCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CommentLabelType = 'feedback' | 'question' | 'suggestion';

export interface CommentLabel {
  type: CommentLabelType;
  count: number;
}

interface CommentLabelsProps {
  labels: CommentLabel[];
  className?: string;
  showIcons?: boolean;
}

const LABEL_CONFIG: Record<
  CommentLabelType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: 'success' | 'warning' | 'brand' }
> = {
  feedback: {
    label: 'Feedback',
    icon: MessageCircle,
    color: 'success'
  },
  question: {
    label: 'Question',
    icon: HelpCircle,
    color: 'warning'
  },
  suggestion: {
    label: 'Suggestion',
    icon: Lightbulb,
    color: 'brand'
  }
};

export const CommentLabels: React.FC<CommentLabelsProps> = ({
  labels,
  className,
  showIcons = true
}) => {
  if (labels.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {labels.map((label, index) => {
        const config = LABEL_CONFIG[label.type];
        const Icon = config.icon;

        return (
          <Badge
            key={index}
            type="pill-color"
            color={config.color}
            size="sm"
            className="flex items-center gap-1 text-xs"
          >
            {showIcons && <Icon className="h-3 w-3" />}
            <span>{config.label}</span>
            <span className="opacity-75">({label.count})</span>
          </Badge>
        );
      })}
    </div>
  );
};
