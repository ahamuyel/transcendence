import Link from "next/link"
import { ArrowRight, Sparkles, GraduationCap, Users, Calendar, BarChart3 } from "lucide-react"
import type { PlatformBranding } from "@/types/landing"

type Props = {
  branding: PlatformBranding
  schools: { name: string }[]
}

export default function HeroSection({ branding, schools }: Props) {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-15%] w-[700px] h-[700px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[600px] h-[600px] rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-[120px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-400/10 dark:bg-cyan-600/5 blur-[100px] animate-pulse [animation-delay:2s]" />
        <div className="absolute bottom-[20%] left-[15%] w-[300px] h-[300px] rounded-full bg-emerald-400/10 dark:bg-emerald-600/5 blur-[100px] animate-pulse [animation-delay:3s]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col gap-8">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-2 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Plataforma de Gestão Escolar para Angola
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              A sua escola,
              <br />
              mais{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                organizada
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed">
              {branding.description ||
                "Centralize a gestão de alunos, professores, notas e comunicação numa única plataforma moderna."}
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link
                href="/signin"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Começar agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/registar-escola"
                className="px-7 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-semibold hover:scale-[1.02] active:scale-[0.98]"
              >
                Registar escola
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {schools.length > 0
                  ? schools.map((school, i) => {
                    const colors = ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500"]
                    const initials = school.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    return (
                      <div key={i} className={`w-8 h-8 rounded-full ${colors[i % colors.length]} border-2 border-white dark:border-zinc-950 flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-white">{initials}</span>
                      </div>
                    )
                  })
                  : ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500"].map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-white dark:border-zinc-950`} />
                  ))
                }
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Escolas em Angola já utilizam o{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{branding.name}</span>
              </p>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/30 p-6 space-y-5">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Dashboard Escolar</div>
                      <div className="text-xs text-zinc-400">Visão geral</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Alunos", value: "1.247", icon: Users, color: "from-indigo-500 to-indigo-600" },
                    { label: "Professores", value: "86", icon: GraduationCap, color: "from-violet-500 to-violet-600" },
                    { label: "Turmas", value: "42", icon: Calendar, color: "from-cyan-500 to-cyan-600" },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3.5 space-y-2"
                      >
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-[11px] text-zinc-400">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Chart mock */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-500">Desempenho mensal</span>
                    <BarChart3 className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400 dark:from-indigo-600 dark:to-violet-500 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute -bottom-6 -left-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl p-4 flex items-center gap-3 animate-bounce [animation-duration:3s]">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold">Notas lançadas</div>
                  <div className="text-[11px] text-zinc-400">Turma 10A - Matemática</div>
                </div>
              </div>

              {/* Floating user card */}
              <div className="absolute -top-4 -right-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl p-4 flex items-center gap-3 animate-bounce [animation-duration:4s] [animation-delay:1s]">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold">+12 alunos</div>
                  <div className="text-[11px] text-zinc-400">Matriculados hoje</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
