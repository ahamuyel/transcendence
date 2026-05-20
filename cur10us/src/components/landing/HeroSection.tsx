import Link from "next/link"
import { ArrowRight, Sparkles, GraduationCap, Users, Calendar, BarChart3 } from "lucide-react"
import type { PlatformBranding } from "@/types/landing"
import type { LandingCopy } from "./landing-i18n"

type Props = {
  branding: PlatformBranding
  schools: { name: string }[]
  copy: LandingCopy["hero"]
}

export default function HeroSection({ branding, schools, copy }: Props) {
  // Filter unique school names and repeat them for the infinite marquee effect
  const uniqueSchoolNames = Array.from(new Set(schools.map((s) => s.name.trim())))
  const marqueeItems = uniqueSchoolNames.length > 0 
    ? [...uniqueSchoolNames, ...uniqueSchoolNames] 
    : []

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex sm:items-center">
      {/* Estilos Inline para Animação de Letreiro Infinito (Estilo Styled Components) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-seamless {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-infinite-track {
          display: flex;
          width: max-content;
          animation: marquee-seamless 15s linear infinite;
        }
        .marquee-infinite-track:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 sm:gap-8">
            <span className="inline-flex items-center gap-2 text-[10px] sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit backdrop-blur-sm max-w-[220px] sm:max-w-none text-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-normal leading-tight">{copy.badge}</span>
            </span>

            <h1 className="text-2xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] px-2 sm:px-0">
              {copy.titlePrefix}
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                {copy.titleAccent}
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed mx-auto lg:mx-0 px-4 sm:px-0">
              {branding.description ||
                copy.fallbackDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0 justify-center lg:justify-start">
              <Link
                href="/signin"
                className="group inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                {copy.primaryCta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/registar-escola"
                className="inline-flex items-center justify-center px-4 sm:px-7 py-3 sm:py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-semibold hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                {copy.secondaryCta}
              </Link>
            </div>

            {uniqueSchoolNames.length > 0 && (
              <div className="space-y-3 pt-1 w-full flex flex-col items-center lg:items-start px-4 sm:px-0">
                <p className="text-[10px] sm:text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {copy.schoolsHeading}
                </p>
                
                {/* Contêiner do Letreiro (Marquee) - Seamless & Infinite */}
                <div 
                  className="marquee-wrap mx-auto lg:mx-0 w-full max-w-[200px] sm:max-w-sm overflow-hidden relative"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                  }}
                >
                  <div className="marquee-infinite-track">
                    {/* Renderizamos a lista duas vezes para o loop infinito sem gaps */}
                    {marqueeItems.map((item, index) => (
                      <div key={`${item}-${index}`} className="flex items-center whitespace-nowrap">
                        <span className="text-[10px] sm:text-[13px] font-bold text-zinc-600 dark:text-zinc-400 px-3">
                          {item}
                        </span>
                        <span className="text-indigo-500/50 text-xs">✦</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative mt-16 sm:mt-20 lg:mt-0 px-4 sm:px-0">
            <div className="relative max-w-[440px] mx-auto lg:max-w-none">
              {/* Main card */}
              <div className="landing-panel-3d rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/30 p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] sm:text-sm font-semibold">{copy.dashboardTitle}</div>
                      <div className="text-[10px] sm:text-xs text-zinc-400">{copy.dashboardSubtitle}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400/80" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400/80" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400/80" />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { label: copy.students, value: "1.247", icon: Users, color: "from-indigo-500 to-indigo-600" },
                    { label: copy.teachers, value: "86", icon: GraduationCap, color: "from-violet-500 to-violet-600" },
                    { label: copy.classes, value: "42", icon: Calendar, color: "from-cyan-500 to-cyan-600" },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-2 sm:p-3.5 space-y-1.5 sm:space-y-2"
                      >
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                        </div>
                        <div className="text-sm sm:text-lg font-bold">{stat.value}</div>
                        <div className="text-[9px] sm:text-[11px] text-zinc-400 truncate">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Chart mock */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-xs font-medium text-zinc-500">{copy.chartLabel}</span>
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" />
                  </div>
                  <div className="flex items-end gap-1.5 sm:gap-2 h-16 sm:h-24">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm sm:rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400 dark:from-indigo-600 dark:to-violet-500 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div className="landing-panel-3d absolute -top-3 sm:-top-4 -right-1 sm:-right-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 animate-bounce [animation-duration:3s]">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-[9px] sm:text-xs font-semibold">{copy.notificationTitle}</div>
                  <div className="text-[8px] sm:text-[11px] text-zinc-400">{copy.notificationSubtitle}</div>
                </div>
              </div>

              {/* Floating user card */}
              <div className="landing-panel-3d absolute -bottom-4 sm:-bottom-6 -left-1 sm:-left-8 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 animate-bounce [animation-duration:4s] [animation-delay:1s]">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 sm:w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] sm:text-xs font-semibold">{copy.userCardTitle}</div>
                  <div className="text-[8px] sm:text-[11px] text-zinc-400">{copy.userCardSubtitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
