"use client"

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type Column = {
  header: string
  accessor: string
  className?: string
  sortable?: boolean
  sortField?: string
}

type SortConfig = { field: string; dir: "asc" | "desc" }

type DataTableProps = {
  columns: Column[]
  renderRow: (item: any) => React.ReactNode
  data: any[]
  sort?: SortConfig | null
  onSort?: (sort: SortConfig | null) => void
}

const DataTable = ({ columns, renderRow, data, sort, onSort }: DataTableProps) => {
  const handleSort = (col: Column) => {
    if (!onSort || !col.sortable) return
    const field = col.sortField || col.accessor
    if (sort?.field === field) {
      if (sort.dir === "asc") onSort({ field, dir: "desc" })
      else onSort(null)
    } else {
      onSort({ field, dir: "asc" })
    }
  }

  const renderSortIcon = (col: Column) => {
    if (!col.sortable) return null
    const field = col.sortField || col.accessor
    const isActive = sort?.field === field
    if (isActive) {
      return sort?.dir === "asc" ? (
        <ChevronUp size={13} className="shrink-0" />
      ) : (
        <ChevronDown size={13} className="shrink-0" />
      )
    }
    return <ChevronsUpDown size={13} className="shrink-0 opacity-30 group-hover:opacity-60 transition-opacity" />
  }

  return (
    <table className="w-full mt-2 sm:mt-4 border-separate border-spacing-0">
      <thead>
        <tr className="text-left text-zinc-400 dark:text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
          {columns.map((col) => (
            <th
              key={col.accessor}
              className={cn(
                "pb-2 sm:pb-4 px-1.5 sm:px-2",
                col.className,
                col.sortable && "cursor-pointer select-none group"
              )}
              onClick={() => handleSort(col)}
            >
              <div className="flex items-center gap-1">
                <span>{col.header}</span>
                {renderSortIcon(col)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {data.map((item) => renderRow(item))}
      </tbody>
    </table>
  )
}

export default DataTable
