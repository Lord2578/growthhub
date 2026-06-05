import { Skeleton } from '@/components/ui/skeleton'

export default function GrowthLoading() {
  return (
    <div className="flex flex-col">
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center">
        <Skeleton className="h-5 w-24 rounded-lg" />
      </div>
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    </div>
  )
}
