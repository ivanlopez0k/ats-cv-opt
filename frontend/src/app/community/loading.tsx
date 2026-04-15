import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityLoading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <Skeleton className="h-16 border-b bg-muted" />

      <div className="container mx-auto px-4 py-8">
        {/* Title and filters skeleton */}
        <Skeleton className="h-10 w-48 mb-4 bg-muted" />
        <Skeleton className="h-10 w-full mb-6 bg-muted" />

        {/* CV grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
