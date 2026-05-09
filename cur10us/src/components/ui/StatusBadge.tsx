const statusColors: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  em_analise: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  aprovada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  ativa: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  matriculada: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  rejeitada: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  suspensa: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  // Ticket statuses
  aberto: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  em_andamento: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  resolvido: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  arquivado: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  // Import statuses
  processando: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  concluida: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  parcial: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  falhada: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  ativa: "Ativa",
  matriculada: "Matriculada",
  rejeitada: "Rejeitada",
  suspensa: "Suspensa",
  // Ticket statuses
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  arquivado: "Arquivado",
  // Import statuses
  processando: "Processando",
  concluida: "Concluída",
  parcial: "Parcial",
  falhada: "Falhada",
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-zinc-100 text-zinc-600"}`}
    >
      {statusLabels[status] || status}
    </span>
  )
}
