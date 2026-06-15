import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Loading skeleton matching the voice changer layout */
export function VoiceChangerSkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}

/** Inline processing indicator */
export function ProcessingIndicator({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-4">
      <div className="relative h-5 w-5">
        <div className="absolute inset-0 animate-ping rounded-full bg-violet-400 opacity-40" />
        <div className="relative h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      </div>
      <span className="text-sm font-medium text-violet-200">{message}</span>
    </div>
  );
}
