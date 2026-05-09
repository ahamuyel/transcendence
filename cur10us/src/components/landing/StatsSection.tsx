"use client"

import { useEffect, useState, useRef } from "react"
import { School, Users, GraduationCap, BookOpen } from "lucide-react"

type Props = {
  schools: number
  students: number
  teachers: number
  classes: number
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

const statItems = [
  {
    key: "schools" as const,
    icon: School,
    label: "Escolas registadas",
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/50",
    ring: "ring-indigo-100 dark:ring-indigo-900/50",
  },
  {
    key: "students" as const,
    icon: Users,
    label: "Alunos na plataforma",
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    ring: "ring-violet-100 dark:ring-violet-900/50",
  },
  {
    key: "teachers" as const,
    icon: GraduationCap,
    label: "Professores activos",
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/50",
    ring: "ring-cyan-100 dark:ring-cyan-900/50",
  },
  {
    key: "classes" as const,
    icon: BookOpen,
    label: "Turmas criadas",
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    ring: "ring-emerald-100 dark:ring-emerald-900/50",
  },
]

export default function StatsSection(props: Props) {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statItems.map((stat) => {
          const Icon = stat.icon
          const value = props[stat.key]
          return (
            <div
              key={stat.key}
              className={`relative flex flex-col items-center py-8 px-4 rounded-2xl ${stat.bg} ring-1 ${stat.ring} transition-all hover:scale-[1.03]`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                <AnimatedCounter target={value} />
                {value > 0 && <span className="text-2xl">+</span>}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center font-medium">
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
