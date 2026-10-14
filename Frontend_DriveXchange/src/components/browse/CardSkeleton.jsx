// src/components/browse/CardSkeleton.jsx
// Grey placeholder with the same shape as <CarCard />, so the layout doesn't jump.
import { Skeleton } from "../dashboard/ui";

export default function CardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-[#efece6] bg-white">
      <Skeleton className="aspect-[16/9] shrink-0 rounded-none" />
      <div className="flex min-h-[128px] flex-1 flex-col justify-between px-5 pb-4 pt-4">
        <div>
          <div className="flex justify-between gap-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/4" />
          </div>
          <Skeleton className="mt-3 h-4 w-1/3" />
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}