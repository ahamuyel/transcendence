import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  // Show limited page numbers on mobile
  const getVisiblePages = () => {
    const pages: number[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      const start = Math.max(1, currentPage - 1)
      const end = Math.min(totalPages, start + maxVisible - 1)
      for (let i = start; i <= end; i++) pages.push(i)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2 sm:py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95"
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition ${
              page === currentPage
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95"
      >
        <span className="hidden sm:inline">Próximo</span>
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

export default Pagination
