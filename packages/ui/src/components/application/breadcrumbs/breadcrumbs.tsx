'use client';

import Link from 'next/link';
import { ChevronRight } from '@untitledui/icons';

interface BreadcrumbItemProps {
  href?: string;
  current?: boolean;
  children: React.ReactNode;
}

function BreadcrumbItem({ href, children }: BreadcrumbItemProps) {
  if (href) {
    return (
      <Link href={href} className="text-tertiary transition hover:text-primary">
        {children}
      </Link>
    );
  }
  return <span className="font-medium text-primary">{children}</span>;
}

interface BreadcrumbsProps {
  children: React.ReactNode;
  className?: string;
}

function BreadcrumbsRoot({ children, className }: BreadcrumbsProps) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm ${className ?? 'mb-4'}`}
    >
      {childArray.map((child, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-4 w-4 text-quaternary" />}
          {child}
        </span>
      ))}
    </nav>
  );
}

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item: BreadcrumbItem,
});
