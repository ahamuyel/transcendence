import { Users, UserRound, UserCheck, BookOpen } from "lucide-react"

const typeConfig: Record<
  string,
  { label: string; icon: React.ElementType; cardBg: string; iconBg: string }
> = {
  students: {
    label: "Alunos",
    icon: Users,
    cardBg: "bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700",
    iconBg: "bg-white/20",
  },
  teachers: {
    label: "Professores",
    icon: UserRound,
    cardBg: "bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700",
    iconBg: "bg-white/20",
  },
  parents: {
    label: "Encarregados",
    icon: UserCheck,
    cardBg: "bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
    iconBg: "bg-white/20",
  },
  classes: {
    label: "Turmas",
    icon: BookOpen,
    cardBg: "bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700",
    iconBg: "bg-white/20",
  },
}

const UserCard = ({ type, count }: { type: string; count: number }) => {
  const config = typeConfig[type] ?? typeConfig.students
  const Icon = config.icon

  return (
    <div className={`${config.cardBg} rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-2.5 rounded-xl ${config.iconBg}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-none">
        {count.toLocaleString("pt")}
      </h2>

      <p className="text-[11px] sm:text-xs font-medium text-white/70 mt-1">
        {config.label}
      </p>
    </div>
  )
}

export default UserCard
