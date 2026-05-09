import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  subtitle?: string
  href?: string
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-950/50" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-cyan-100 dark:bg-cyan-950/50" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-950/50" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-950/50" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-100 dark:bg-rose-950/50" },
}

const StatCard = ({ label, value, icon: Icon, color, subtitle, href }: StatCardProps) => {
  const c = colorMap[color] || colorMap.indigo

  const content = (
    <div className={`rounded-2xl p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${href ? "hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={c.text} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">{label}</p>
          <p className={`text-lg sm:text-xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-[10px] text-zinc-400 truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

export default StatCard
