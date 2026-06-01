"use client"

import { Loader2 } from "lucide-react"

type CardGridProps = {
  renderCard: (item: any) => React.ReactNode
  data: any[]
  loading?: boolean
  emptyMessage?: string
}

const CardGrid = ({
  renderCard,
  data,
  loading,
  emptyMessage = "Nenhum registo encontrado",
}: CardGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-primary" />
          <p className="text-sm text-zinc-400">A carregar...</p>
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-2 sm:mt-4">
      {data.map((item) => renderCard(item))}
    </div>
  )
}

export default CardGrid
