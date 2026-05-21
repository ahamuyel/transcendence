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

function DecoZigzag() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 0 40 L 20 20 L 40 40 L 60 20 L 80 40 L 100 20" opacity="0.8" />
      <path d="M 0 55 L 20 35 L 40 55 L 60 35 L 80 55 L 100 35" opacity="0.6" />
      <path d="M 0 70 L 20 50 L 40 70 L 60 50 L 80 70 L 100 50" opacity="0.4" />
    </svg>
  )
}

function DecoDiamond() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" opacity="0.8" />
      <path d="M 50 25 L 75 50 L 50 75 L 25 50 Z" opacity="0.6" />
      <path d="M 50 40 L 60 50 L 50 60 L 40 50 Z" opacity="0.4" />
    </svg>
  )
}

function DecoCircles() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="50" r="40" opacity="0.8" />
      <circle cx="50" cy="50" r="25" opacity="0.6" />
      <circle cx="50" cy="50" r="10" opacity="0.4" />
    </svg>
  )
}

function DecoWavyVertical() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 0 Q 30 25 20 50 T 20 100" opacity="0.8" />
      <path d="M 40 0 Q 50 25 40 50 T 40 100" opacity="0.6" />
      <path d="M 60 0 Q 70 25 60 50 T 60 100" opacity="0.4" />
    </svg>
  )
}

function DecoSymbols() {
  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="30" r="5" opacity="0.8" />
      <circle cx="50" cy="30" r="2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="80" cy="30" r="5" opacity="0.8" />
      <path d="M 50 60 L 65 75 L 50 90 L 35 75 Z" opacity="0.7" />
      <circle cx="20" cy="75" r="3" fill="currentColor" stroke="none" opacity="0.5" />
      <circle cx="80" cy="75" r="3" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  )
}

const featureVisuals = [
  {
    icon: LayoutDashboard,
    gradient: "from-indigo-500 to-indigo-600",
    span: "sm:col-span-2 lg:col-span-2",
    decoColor: "text-indigo-500/30 dark:text-indigo-400/30",
    deco: DecoZigzag,
  },
  {
    icon: Users,
    gradient: "from-cyan-500 to-cyan-600",
    span: "",
    decoColor: "text-cyan-500/30 dark:text-cyan-400/30",
    deco: DecoDiamond,
  },
  {
    icon: ClipboardCheck,
    gradient: "from-emerald-500 to-emerald-600",
    span: "",
    decoColor: "text-emerald-500/30 dark:text-emerald-400/30",
    deco: DecoCircles,
  },
  {
    icon: GraduationCap,
    gradient: "from-amber-500 to-amber-600",
    span: "",
    decoColor: "text-amber-500/30 dark:text-amber-400/30",
    deco: DecoWavyVertical,
  },
  {
    icon: MessageSquare,
    gradient: "from-rose-500 to-rose-600",
    span: "",
    decoColor: "text-rose-500/30 dark:text-rose-400/30",
    deco: DecoSymbols,
  },
  {
    icon: FileText,
    gradient: "from-violet-500 to-violet-600",
    span: "sm:col-span-2 lg:col-span-2",
    decoColor: "text-violet-500/30 dark:text-violet-400/30",
    deco: DecoZigzag,
  },
  {
    icon: Calendar,
    gradient: "from-sky-500 to-sky-600",
    span: "",
    decoColor: "text-sky-500/30 dark:text-sky-400/30",
    deco: DecoDiamond,
  },
  {
    icon: BarChart3,
    gradient: "from-orange-500 to-orange-600",
    span: "",
    decoColor: "text-orange-500/30 dark:text-orange-400/30",
    deco: DecoCircles,
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
