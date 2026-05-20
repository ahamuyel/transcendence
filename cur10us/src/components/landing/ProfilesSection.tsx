import { LayoutDashboard, BookOpen, ClipboardList, ShieldCheck, CheckCircle2 } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"
import type { LandingCopy } from "./landing-i18n"

const profileVisuals = [
  {
    icon: LayoutDashboard,
    gradient: "from-indigo-500 to-indigo-600",
    accent: "text-indigo-600 dark:text-indigo-400",
    border: "hover:border-indigo-300 dark:hover:border-indigo-800",
  },
  {
    icon: BookOpen,
    gradient: "from-emerald-500 to-emerald-600",
    accent: "text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-300 dark:hover:border-emerald-800",
  },
  {
    icon: ClipboardList,
    gradient: "from-amber-500 to-amber-600",
    accent: "text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  {
    icon: ShieldCheck,
    gradient: "from-rose-500 to-rose-600",
    accent: "text-rose-600 dark:text-rose-400",
    border: "hover:border-rose-300 dark:hover:border-rose-800",
  },
]

export default function ProfilesSection({ copy }: { copy: LandingCopy["profiles"] }) {
  return (
    <section id="para-quem" className="py-28 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-zinc-50/50 dark:bg-zinc-950/50" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            {copy.badge}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
            {copy.titlePrefix}{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {copy.titleAccent}
            </span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            {copy.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {profileVisuals.map((profile, i) => {
            const Icon = profile.icon
            const content = copy.items[i]
            return (
              <AnimateOnScroll key={content.role} delay={i * 100}>
                <div className={`landing-panel-3d group rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm ${profile.border} p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/20`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-4">{content.role}</h3>
                  <ul className="space-y-3">
                    {content.benefits.map((item) => (
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
