'use client';

import { ArrowLeft, ArrowRight } from '@untitledui/icons';
import { Button } from "../../../components/base/buttons/button";

interface SimplePaginationProps {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function SimplePagination({ page, hasMore, onPrev, onNext }: SimplePaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between border-t border-secondary pt-4"
    >
      <Button
        color="secondary"
        size="sm"
        iconLeading={ArrowLeft}
        isDisabled={page <= 0}
        onClick={onPrev}
      >
        Précédent
      </Button>

      <span className="text-sm text-tertiary">
        Page <span className="font-semibold text-primary">{page + 1}</span>
      </span>

      <Button
        color="secondary"
        size="sm"
        iconTrailing={ArrowRight}
        isDisabled={!hasMore}
        onClick={onNext}
      >
        Suivant
      </Button>
    </nav>
  );
}
