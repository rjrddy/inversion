import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-md border p-3 space-y-2">
            {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-14 w-full" />)}
          </div>
        ))}
      </div>
    </div>
  )
}


