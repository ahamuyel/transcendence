import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  FileText,
  Calendar,
  BarChart3,
} from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"
import type { LandingCopy } from "./landing-i18n"

const featureVisuals = [
  {
    icon: LayoutDashboard,
    gradient: "from-indigo-500 to-indigo-600",
    span: "sm:col-span-2 lg:col-span-2",
  },
  {
    icon: Users,
    gradient: "from-cyan-500 to-cyan-600",
    span: "",
  },
  {
    icon: ClipboardCheck,
    gradient: "from-emerald-500 to-emerald-600",
    span: "",
  },
  {
    icon: GraduationCap,
    gradient: "from-amber-500 to-amber-600",
    span: "",
  },
  {
    icon: MessageSquare,
    gradient: "from-rose-500 to-rose-600",
    span: "",
  },
  {
    icon: FileText,
    gradient: "from-violet-500 to-violet-600",
    span: "sm:col-span-2 lg:col-span-2",
  },
  {
    icon: Calendar,
    gradient: "from-sky-500 to-sky-600",
    span: "",
  },
  {
    icon: BarChart3,
    gradient: "from-orange-500 to-orange-600",
    span: "",
  },
]

export default function FeaturesSection({ copy }: { copy: LandingCopy["features"] }) {
  return (
    <section id="funcionalidades" className="py-28 px-6 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-400/5 dark:bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            {copy.badge}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
            {copy.titlePrefix}{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {copy.titleAccent}
            </span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            {copy.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureVisuals.map((item, i) => {
            const Icon = item.icon
            const content = copy.items[i]
            return (
              <AnimateOnScroll key={content.title} delay={i * 60}>
                <div
                  className={`group relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 h-full overflow-hidden hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/20 ${item.span}`}
                >
                  {/* Hover gradient glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06] transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{content.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {content.description}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
