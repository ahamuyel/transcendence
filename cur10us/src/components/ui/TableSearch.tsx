"use client"
import { Search } from "lucide-react"

type TableSearchProps = {
  value?: string
  onChange?: (value: string) => void
}

const TableSearch = ({ value, onChange }: TableSearchProps) => {
  return (
    <div className="group w-full flex items-center gap-2 text-sm rounded-xl ring-[1.5px] ring-zinc-200 dark:ring-zinc-800 px-2.5 sm:px-3 py-1.5 sm:py-1 bg-white dark:bg-zinc-950 transition-all focus-within:ring-indigo-600 dark:focus-within:ring-indigo-500 shadow-sm">
      <Search
        size={14}
        className="text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors shrink-0"
      />
      <input
        type="text"
        placeholder="Pesquisar..."
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full p-1.5 sm:p-2 bg-transparent outline-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400"
      />
    </div>
  )
}

export default TableSearch
