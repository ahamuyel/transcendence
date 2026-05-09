import { LayoutDashboard, BookOpen, ClipboardList, ShieldCheck, CheckCircle2 } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

const profiles = [
  {
    icon: LayoutDashboard,
    role: "Gestores Escolares",
    gradient: "from-indigo-500 to-indigo-600",
    accent: "text-indigo-600 dark:text-indigo-400",
    border: "hover:border-indigo-300 dark:hover:border-indigo-800",
    benefits: [
      "Visão geral da escola em tempo real",
      "Relatórios de desempenho e assiduidade",
      "Gestão de turmas, professores e admissões",
      "Controlo financeiro e estatísticas",
    ],
  },
  {
    icon: BookOpen,
    role: "Professores",
    gradient: "from-emerald-500 to-emerald-600",
    accent: "text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-300 dark:hover:border-emerald-800",
    benefits: [
      "Lançamento rápido de notas e presenças",
      "Calendário de aulas e exames",
      "Acompanhamento individual do aluno",
      "Gestão de trabalhos e submissões",
    ],
  },
  {
    icon: ClipboardList,
    role: "Alunos",
    gradient: "from-amber-500 to-amber-600",
    accent: "text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-300 dark:hover:border-amber-800",
    benefits: [
      "Consulta de notas e boletins",
      "Horário e calendário escolar",
      "Histórico de assiduidade",
      "Portfólio académico digital",
    ],
  },
  {
    icon: ShieldCheck,
    role: "Encarregados de Educação",
    gradient: "from-rose-500 to-rose-600",
    accent: "text-rose-600 dark:text-rose-400",
    border: "hover:border-rose-300 dark:hover:border-rose-800",
    benefits: [
      "Acompanhamento do educando em tempo real",
      "Notificações de faltas e desempenho",
      "Comunicação directa com a escola",
      "Acesso a boletins e relatórios",
    ],
  },
]

export default function ProfilesSection() {
  return (
    <section id="para-quem" className="py-28 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-zinc-50/50 dark:bg-zinc-950/50" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            Para toda a comunidade
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
            Uma experiência para{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              cada perfil
            </span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Cada utilizador acede ao que é relevante para o seu papel na comunidade escolar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {profiles.map((profile, i) => {
            const Icon = profile.icon
            return (
              <AnimateOnScroll key={profile.role} delay={i * 100}>
                <div className={`group rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 ${profile.border} p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/20`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-4">{profile.role}</h3>
                  <ul className="space-y-3">
                    {profile.benefits.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                        <CheckCircle2 className={`w-4 h-4 ${profile.accent} mt-0.5 shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
