"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Clock, Settings, Rocket, Check, ChevronLeft, ChevronRight } from "lucide-react"
import type { LandingCopy } from "./landing-i18n"

type Props = {
  copy: LandingCopy["how"]
}

const stepIcons = [FileText, Clock, Settings, Rocket]

function RegistrationMockup() {
  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-900/10 dark:shadow-black/30 p-4 sm:p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[12px] sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Registar Escola</div>
            <div className="text-[10px] sm:text-xs text-zinc-400">Novo registo</div>
          </div>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4 space-y-1">
          <div className="text-[10px] sm:text-xs font-medium text-zinc-400">Nome da Escola</div>
          <div className="h-8 sm:h-9 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 flex items-center">
            <span className="text-[11px] sm:text-sm text-zinc-400">Escola Exemplo</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4 space-y-1">
            <div className="text-[10px] sm:text-xs font-medium text-zinc-400">Email</div>
            <div className="h-8 sm:h-9 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 flex items-center">
              <span className="text-[11px] sm:text-sm text-zinc-400">email@exemplo.ao</span>
            </div>
          </div>
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4 space-y-1">
            <div className="text-[10px] sm:text-xs font-medium text-zinc-400">Telefone</div>
            <div className="h-8 sm:h-9 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 flex items-center">
              <span className="text-[11px] sm:text-sm text-zinc-400">+244 900 000 000</span>
            </div>
          </div>
        </div>
        <div className="h-9 sm:h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
          <span className="text-xs sm:text-sm font-semibold text-white">Submeter candidatura</span>
        </div>
      </div>
    </div>
  )
}

function ApprovalMockup() {
  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-900/10 dark:shadow-black/30 p-4 sm:p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[12px] sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Candidatura</div>
            <div className="text-[10px] sm:text-xs text-zinc-400">Escola Exemplo</div>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700/50">
          <span className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400">Pendente</span>
        </div>
      </div>
      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <div className="text-[11px] sm:text-sm font-medium text-zinc-900 dark:text-zinc-100">Registo submetido</div>
            <div className="text-[9px] sm:text-xs text-zinc-400">12 Mai 2026</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <div className="text-[11px] sm:text-sm font-medium text-zinc-900 dark:text-zinc-100">Em análise</div>
            <div className="text-[9px] sm:text-xs text-zinc-400">A aguardar aprovação</div>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-40">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-zinc-300 dark:border-zinc-600 flex items-center justify-center shrink-0">
            <Rocket className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-left">
            <div className="text-[11px] sm:text-sm font-medium text-zinc-500 dark:text-zinc-500">Escola activada</div>
            <div className="text-[9px] sm:text-xs text-zinc-400">Próximo passo</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigMockup() {
  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-900/10 dark:shadow-black/30 p-4 sm:p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[12px] sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Configuração</div>
            <div className="text-[10px] sm:text-xs text-zinc-400">Personalizar</div>
          </div>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-sm font-medium text-zinc-900 dark:text-zinc-100">Turmas</div>
            <div className="text-[9px] sm:text-xs text-zinc-400">Adicionar turmas</div>
          </div>
          <div className="w-10 h-5 sm:w-12 sm:h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 relative shadow-inner">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-sm font-medium text-zinc-900 dark:text-zinc-100">Professores</div>
            <div className="text-[9px] sm:text-xs text-zinc-400">Convidar professores</div>
          </div>
          <div className="w-10 h-5 sm:w-12 sm:h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 relative shadow-inner">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-sm font-medium text-zinc-900 dark:text-zinc-100">Alunos</div>
            <div className="text-[9px] sm:text-xs text-zinc-400">Importar lista</div>
          </div>
          <div className="w-10 h-5 sm:w-12 sm:h-6 rounded-full bg-zinc-300 dark:bg-zinc-600 relative shadow-inner">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardReadyMockup() {
  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-900/10 dark:shadow-black/30 p-4 sm:p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[12px] sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Escola Activa</div>
            <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">Tudo pronto</div>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400/80" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400/80" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400/80" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-2 sm:p-3.5 space-y-1">
          <div className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">547</div>
          <div className="text-[9px] sm:text-[11px] text-zinc-400">Alunos</div>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-2 sm:p-3.5 space-y-1">
          <div className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">28</div>
          <div className="text-[9px] sm:text-[11px] text-zinc-400">Turmas</div>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-2 sm:p-3.5 space-y-1">
          <div className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">42</div>
          <div className="text-[9px] sm:text-[11px] text-zinc-400">Professores</div>
        </div>
      </div>
      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-zinc-500">Desempenho mensal</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2 h-12 sm:h-16">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500 to-green-400 dark:from-emerald-600 dark:to-green-500 opacity-80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const mockups = [RegistrationMockup, ApprovalMockup, ConfigMockup, DashboardReadyMockup]

export default function HowItWorksSection({ copy }: Props) {
  const [current, setCurrent] = useState(0)
  const total = copy.steps.length

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total)
    }, 5000)
    return () => clearInterval(interval)
  }, [total])

  const goTo = useCallback((i: number) => setCurrent(i), [])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total])
  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total])

  return (
    <section id="como-funciona" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 sm:mb-20">
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

        <div className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {copy.steps.map((step, i) => {
                const MockupComponent = mockups[i]
                const StepIcon = stepIcons[i]
                return (
                  <div key={i} className="w-full flex-shrink-0 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center px-2">
                    <div className="w-full max-w-[480px] lg:order-2">
                      <MockupComponent />
                    </div>
                    <div className="flex-1 text-center lg:text-left max-w-md">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg mb-5 mx-auto lg:mx-0`}>
                        <StepIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-3">
                        Passo {i + 1}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
                        {step.title}
                      </h3>
                      <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Passo anterior"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-gradient-to-r from-indigo-500 to-violet-500"
                      : "w-2 bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
                  }`}
                  aria-label={`Passo ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Próximo passo"
            >
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
