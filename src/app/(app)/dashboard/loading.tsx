import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center">
        <Skeleton className="h-5 w-40 rounded-lg" />
      </div>
      <div className="p-4 md:p-6 space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        {/* Salary progress */}
        <Skeleton className="h-28" />
        {/* Streak cards */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
        {/* Tasks */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  )
}
