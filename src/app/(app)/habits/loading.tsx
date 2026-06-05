import { Skeleton } from '@/components/ui/skeleton'

export default function HabitsLoading() {
  return (
    <div className="flex flex-col">
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center">
        <Skeleton className="h-5 w-24 rounded-lg" />
      </div>
      <div className="p-4 md:p-6">
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}
