import { Skeleton } from '@/components/ui/skeleton';

export default function NewCVLoading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <Skeleton className="h-16 border-b bg-muted" />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Title skeleton */}
        <Skeleton className="h-10 w-48 mb-2 bg-muted" />
        <Skeleton className="h-5 w-72 mb-8 bg-muted" />

        {/* Form skeleton */}
        <Skeleton className="h-96 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
