import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <Skeleton className="h-16 border-b bg-muted" />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Title skeleton */}
        <Skeleton className="h-10 w-48 mb-2 bg-muted" />
        <Skeleton className="h-5 w-64 mb-8 bg-muted" />

        {/* CV grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
