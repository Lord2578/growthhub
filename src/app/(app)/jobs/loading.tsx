import { Skeleton } from '@/components/ui/skeleton'

export default function JobsLoading() {
  return (
    <div className="flex flex-col">
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center">
        <Skeleton className="h-5 w-24 rounded-lg" />
      </div>
      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        {/* Kanban header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
        {/* Kanban columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              {i < 2 && <Skeleton className="h-20 rounded-xl" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
