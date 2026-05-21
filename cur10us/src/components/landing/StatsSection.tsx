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

function ZigzagDeco() {
  return (
    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 0 40 L 20 20 L 40 40 L 60 20 L 80 40 L 100 20" opacity="0.8" />
      <path d="M 0 55 L 20 35 L 40 55 L 60 35 L 80 55 L 100 35" opacity="0.6" />
      <path d="M 0 70 L 20 50 L 40 70 L 60 50 L 80 70 L 100 50" opacity="0.4" />
    </svg>
  )
}

function DiamondDeco() {
  return (
    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" opacity="0.8" />
      <path d="M 50 25 L 75 50 L 50 75 L 25 50 Z" opacity="0.6" />
      <path d="M 50 40 L 60 50 L 50 60 L 40 50 Z" opacity="0.4" />
    </svg>
  )
}

function CircleDeco() {
  return (
    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="50" r="40" opacity="0.8" />
      <circle cx="50" cy="50" r="25" opacity="0.6" />
      <circle cx="50" cy="50" r="10" opacity="0.4" />
    </svg>
  )
}

function WavyDeco() {
  return (
    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 0 Q 30 25 20 50 T 20 100" opacity="0.8" />
      <path d="M 40 0 Q 50 25 40 50 T 40 100" opacity="0.6" />
      <path d="M 60 0 Q 70 25 60 50 T 60 100" opacity="0.4" />
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
    deco: ZigzagDeco,
  },
  {
    key: "students" as const,
    icon: Users,
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-white dark:bg-zinc-900",
    decoColor: "text-violet-500/35 dark:text-violet-400/35",
    deco: DiamondDeco,
  },
  {
    key: "teachers" as const,
    icon: GraduationCap,
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-white dark:bg-zinc-900",
    decoColor: "text-cyan-500/35 dark:text-cyan-400/35",
    deco: CircleDeco,
  },
  {
    key: "classes" as const,
    icon: BookOpen,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-white dark:bg-zinc-900",
    decoColor: "text-emerald-500/35 dark:text-emerald-400/35",
    deco: WavyDeco,
  },
]

export default function StatsSection(props: Props) {
  return (
    <section id="stats-section" className="relative py-20 px-6">
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
