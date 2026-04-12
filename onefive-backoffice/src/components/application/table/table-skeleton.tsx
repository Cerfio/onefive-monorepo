'use client';

import { cx } from '@/utils/cx';

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cx('animate-pulse rounded-md bg-quaternary/40', className)}
    />
  );
}

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <table className="min-w-full divide-y divide-border-secondary">
        <thead className="bg-secondary">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 md:px-6">
                <SkeletonBar className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3 md:px-6 md:py-4">
                  <SkeletonBar
                    className={cx(
                      'h-4',
                      colIdx === 0 ? 'w-32' : colIdx === columns - 1 ? 'ml-auto w-20' : 'w-24',
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardCardsSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset md:gap-5 md:px-5 md:py-5"
        >
          <SkeletonBar className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <SkeletonBar className="h-8 w-16" />
            <SkeletonBar className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
