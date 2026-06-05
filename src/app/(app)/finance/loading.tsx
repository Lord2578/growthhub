import { Skeleton } from '@/components/ui/skeleton'

export default function FinanceLoading() {
  return (
    <div className="flex flex-col">
      <div className="h-14 border-b border-white/[0.05] px-5 flex items-center">
        <Skeleton className="h-5 w-24 rounded-lg" />
      </div>
      <div className="p-4 md:p-6 space-y-6">
        {/* Month selector */}
        <Skeleton className="h-9 w-40 rounded-xl" />
        {/* Income + Expense forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
        {/* Chart */}
        <Skeleton className="h-72" />
        {/* Pie + Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        {/* Expense list */}
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
