"use client"

import { useEffect, useState, useRef } from "react"
import { School, Users, GraduationCap, BookOpen } from "lucide-react"
import type { LandingCopy } from "./landing-i18n"

type Props = {
  schools: number
  students: number
  teachers: number
  classes: number
  copy: LandingCopy["stats"]
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}</span>
}

function SchoolDeco() {
  return (
    <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="22" y="32" width="36" height="36" rx="2" opacity="0.75" />
      <polygon points="12,36 40,14 68,36" opacity="0.9" />
      <rect x="36" y="50" width="8" height="18" rx="1" opacity="0.65" />
      <rect x="24" y="42" width="6" height="6" rx="1" opacity="0.5" />
      <rect x="50" y="42" width="6" height="6" rx="1" opacity="0.5" />
    </svg>
  )
}

function StudentsDeco() {
  return (
    <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="22" r="7" opacity="0.7" />
      <path d="M10,45 Q10,32 20,32 Q30,32 30,45" opacity="0.7" />
      <circle cx="40" cy="18" r="7" opacity="0.9" />
      <path d="M30,41 Q30,28 40,28 Q50,28 50,41" opacity="0.9" />
      <circle cx="60" cy="22" r="7" opacity="0.6" />
      <path d="M50,45 Q50,32 60,32 Q70,32 70,45" opacity="0.6" />
    </svg>
  )
}

function TeacherDeco() {
  return (
    <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="40" cy="20" r="8" opacity="0.8" />
      <path d="M28,44 Q28,28 40,28 Q52,28 52,44" opacity="0.8" />
      <rect x="22" y="48" width="36" height="4" rx="1" opacity="0.55" />
      <rect x="30" y="52" width="20" height="16" rx="1" opacity="0.45" />
      <line x1="40" y1="44" x2="40" y2="68" opacity="0.45" />
      <line x1="32" y1="68" x2="48" y2="68" opacity="0.45" />
    </svg>
  )
}

function ClassesDeco() {
  return (
    <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14" y="22" width="22" height="16" rx="1.5" opacity="0.75" />
      <rect x="44" y="22" width="22" height="16" rx="1.5" opacity="0.75" />
      <rect x="14" y="42" width="22" height="16" rx="1.5" opacity="0.55" />
      <rect x="44" y="42" width="22" height="16" rx="1.5" opacity="0.55" />
      <rect x="14" y="62" width="22" height="8" rx="1" opacity="0.35" />
      <rect x="44" y="62" width="22" height="8" rx="1" opacity="0.35" />
    </svg>
  )
}

const statItems = [
  {
    key: "schools" as const,
    icon: School,
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-white dark:bg-zinc-900",
    decoColor: "text-indigo-500/35 dark:text-indigo-400/35",
    deco: SchoolDeco,
  },
  {
    key: "students" as const,
    icon: Users,
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-white dark:bg-zinc-900",
    decoColor: "text-violet-500/35 dark:text-violet-400/35",
    deco: StudentsDeco,
  },
  {
    key: "teachers" as const,
    icon: GraduationCap,
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-white dark:bg-zinc-900",
    decoColor: "text-cyan-500/35 dark:text-cyan-400/35",
    deco: TeacherDeco,
  },
  {
    key: "classes" as const,
    icon: BookOpen,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-white dark:bg-zinc-900",
    decoColor: "text-emerald-500/35 dark:text-emerald-400/35",
    deco: ClassesDeco,
  },
]

export default function StatsSection(props: Props) {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statItems.map((stat) => {
          const Icon = stat.icon
          const value = props[stat.key]
          const Deco = stat.deco
          return (
            <div
              key={stat.key}
              className={`relative flex flex-col items-center py-8 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${stat.bg} transition-all hover:scale-[1.03] hover:shadow-lg overflow-hidden`}
            >
              <div className={`absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 ${stat.decoColor} pointer-events-none`}>
                <Deco />
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                <AnimatedCounter target={value} />
                {value > 0 && <span className="text-2xl">+</span>}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center font-medium">
                {props.copy[stat.key]}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
