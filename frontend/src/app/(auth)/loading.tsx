import { Skeleton } from '@/components/ui/skeleton';

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Skeleton className="w-full max-w-md h-80 rounded-lg bg-muted" />
    </div>
  );
}
