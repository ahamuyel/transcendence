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

function DecoBars() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="10" y="28" width="8" height="24" rx="1.5" opacity="0.75" />
      <rect x="22" y="18" width="8" height="34" rx="1.5" opacity="0.9" />
      <rect x="34" y="24" width="8" height="28" rx="1.5" opacity="0.65" />
      <rect x="46" y="12" width="8" height="40" rx="1.5" opacity="0.8" />
    </svg>
  )
}

function DecoNetwork() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="7" opacity="0.8" />
      <circle cx="44" cy="20" r="7" opacity="0.7" />
      <circle cx="32" cy="44" r="7" opacity="0.75" />
      <line x1="27" y1="22" x2="37" y2="40" opacity="0.5" />
      <line x1="37" y1="22" x2="27" y2="40" opacity="0.5" />
      <line x1="20" y1="27" x2="32" y2="44" opacity="0.4" />
      <line x1="44" y1="27" x2="32" y2="44" opacity="0.4" />
    </svg>
  )
}

function DecoChecklist() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14" y="8" width="36" height="48" rx="3" opacity="0.75" />
      <line x1="22" y1="20" x2="42" y2="20" opacity="0.55" />
      <line x1="22" y1="30" x2="36" y2="30" opacity="0.55" />
      <polyline points="28,46 34,52 42,40" opacity="0.9" />
    </svg>
  )
}

function DecoStar() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="32,6 39,24 58,24 43,36 48,54 32,43 16,54 21,36 6,24 25,24" opacity="0.8" />
      <circle cx="32" cy="30" r="3" opacity="0.55" />
    </svg>
  )
}

function DecoChat() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14,28 Q14,14 32,14 Q50,14 50,28 Q50,42 32,42 Q28,42 24,40 L14,46 L18,38 Q14,34 14,28Z" opacity="0.8" />
      <circle cx="26" cy="28" r="2" opacity="0.55" />
      <circle cx="32" cy="28" r="2" opacity="0.55" />
      <circle cx="38" cy="28" r="2" opacity="0.55" />
    </svg>
  )
}

function DecoDocs() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18,12 L32,12 L42,22 L42,54 Q42,56 40,56 L20,56 Q18,56 18,54 Z" opacity="0.8" />
      <path d="M32,12 L32,22 L42,22" opacity="0.6" />
      <line x1="22" y1="30" x2="38" y2="30" opacity="0.55" />
      <line x1="22" y1="38" x2="38" y2="38" opacity="0.55" />
      <line x1="22" y1="46" x2="34" y2="46" opacity="0.55" />
    </svg>
  )
}

function DecoCalendar() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="16" width="44" height="40" rx="3" opacity="0.75" />
      <line x1="10" y1="28" x2="54" y2="28" opacity="0.65" />
      <line x1="20" y1="10" x2="20" y2="20" opacity="0.65" />
      <line x1="44" y1="10" x2="44" y2="20" opacity="0.65" />
      <circle cx="22" cy="38" r="3" opacity="0.75" />
      <circle cx="32" cy="38" r="3" opacity="0.75" />
      <circle cx="42" cy="38" r="3" opacity="0.75" />
      <circle cx="27" cy="48" r="3" opacity="0.55" />
      <circle cx="37" cy="48" r="3" opacity="0.55" />
    </svg>
  )
}

function DecoLineChart() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8,48 18,38 28,42 38,22 48,30 56,14" opacity="0.9" />
      <circle cx="8" cy="48" r="2.5" opacity="0.65" />
      <circle cx="18" cy="38" r="2.5" opacity="0.65" />
      <circle cx="28" cy="42" r="2.5" opacity="0.65" />
      <circle cx="38" cy="22" r="2.5" opacity="0.65" />
      <circle cx="48" cy="30" r="2.5" opacity="0.65" />
      <circle cx="56" cy="14" r="2.5" opacity="0.85" />
    </svg>
  )
}

const featureVisuals = [
  {
    icon: LayoutDashboard,
    gradient: "from-indigo-500 to-indigo-600",
    span: "sm:col-span-2 lg:col-span-2",
    decoColor: "text-indigo-500/30 dark:text-indigo-400/30",
    deco: DecoBars,
  },
  {
    icon: Users,
    gradient: "from-cyan-500 to-cyan-600",
    span: "",
    decoColor: "text-cyan-500/30 dark:text-cyan-400/30",
    deco: DecoNetwork,
  },
  {
    icon: ClipboardCheck,
    gradient: "from-emerald-500 to-emerald-600",
    span: "",
    decoColor: "text-emerald-500/30 dark:text-emerald-400/30",
    deco: DecoChecklist,
  },
  {
    icon: GraduationCap,
    gradient: "from-amber-500 to-amber-600",
    span: "",
    decoColor: "text-amber-500/30 dark:text-amber-400/30",
    deco: DecoStar,
  },
  {
    icon: MessageSquare,
    gradient: "from-rose-500 to-rose-600",
    span: "",
    decoColor: "text-rose-500/30 dark:text-rose-400/30",
    deco: DecoChat,
  },
  {
    icon: FileText,
    gradient: "from-violet-500 to-violet-600",
    span: "sm:col-span-2 lg:col-span-2",
    decoColor: "text-violet-500/30 dark:text-violet-400/30",
    deco: DecoDocs,
  },
  {
    icon: Calendar,
    gradient: "from-sky-500 to-sky-600",
    span: "",
    decoColor: "text-sky-500/30 dark:text-sky-400/30",
    deco: DecoCalendar,
  },
  {
    icon: BarChart3,
    gradient: "from-orange-500 to-orange-600",
    span: "",
    decoColor: "text-orange-500/30 dark:text-orange-400/30",
    deco: DecoLineChart,
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

                  {/* Decorative illustration */}
                  <div className={`absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 ${item.decoColor} pointer-events-none`}>
                    <item.deco />
                  </div>

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
