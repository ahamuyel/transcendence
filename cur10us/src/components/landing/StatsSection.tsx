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

const statItems = [
  {
    key: "schools" as const,
    icon: School,
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-white dark:bg-zinc-900",
  },
  {
    key: "students" as const,
    icon: Users,
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-white dark:bg-zinc-900",
  },
  {
    key: "teachers" as const,
    icon: GraduationCap,
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-white dark:bg-zinc-900",
  },
  {
    key: "classes" as const,
    icon: BookOpen,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-white dark:bg-zinc-900",
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
              className={`relative flex flex-col items-center py-8 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${stat.bg} transition-all hover:scale-[1.03] hover:shadow-lg`}
            >
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
