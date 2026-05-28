import React from 'react';

import { cn } from '../lib/utils';

export default function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-[2rem] border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 p-6', className)}>
      <div className="h-4 w-3/4 bg-stone-200 dark:bg-stone-700 mb-2 rounded" />
      <div className="h-6 w-1/2 bg-stone-200 dark:bg-stone-700 mb-4 rounded" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-3 w-5/6 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-3 w-4/6 bg-stone-200 dark:bg-stone-700 rounded" />
      </div>
    </div>
  );
}
