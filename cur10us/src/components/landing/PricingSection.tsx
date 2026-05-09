"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight, Zap, Building2, GraduationCap } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

const plans = [
  {
    name: "Básico",
    description: "Para escolas pequenas que estão a começar a digitalizar a gestão.",
    icon: GraduationCap,
    monthlyPrice: 15_000,
    yearlyPrice: 150_000,
    gradient: "from-zinc-600 to-zinc-700",
    popular: false,
    cta: "Começar grátis",
    ctaHref: "/registar-escola",
    features: [
      "Até 200 alunos",
      "3 utilizadores administradores",
      "Gestão de turmas e matrículas",
      "Lançamento de notas",
      "Controlo de assiduidade",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Profissional",
    description: "Para escolas em crescimento que precisam de funcionalidades completas.",
    icon: Zap,
    monthlyPrice: 35_000,
    yearlyPrice: 350_000,
    gradient: "from-indigo-600 to-violet-600",
    popular: true,
    cta: "Começar agora",
    ctaHref: "/registar-escola",
    features: [
      "Até 1.000 alunos",
      "10 utilizadores administradores",
      "Tudo do plano Básico",
      "Candidaturas online",
      "Comunicação interna",
      "Relatórios avançados",
      "Importação Excel/CSV",
      "Suporte prioritário",
    ],
  },
  {
    name: "Institucional",
    description: "Para colégios, grupos escolares e instituições de grande porte.",
    icon: Building2,
    monthlyPrice: null,
    yearlyPrice: null,
    gradient: "from-emerald-600 to-emerald-700",
    popular: false,
    cta: "Falar com a equipa",
    ctaHref: "mailto:suporte@cur10usx.com",
    features: [
      "Alunos ilimitados",
      "Utilizadores ilimitados",
      "Tudo do plano Profissional",
      "Multi-escola (gestão centralizada)",
      "API e integrações personalizadas",
      "Onboarding dedicado",
      "SLA garantido",
      "Gestor de conta dedicado",
    ],
  },
]

function formatKz(value: number) {
  return value.toLocaleString("pt-AO") + " Kz"
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="precos" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            Preços acessíveis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
            Planos pensados para{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              escolas angolanas
            </span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Escolha o plano ideal para a sua escola. Sem surpresas, sem taxas escondidas.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium transition ${!yearly ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}`}>
              Mensal
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                yearly ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  yearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition ${yearly ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}`}>
              Anual
            </span>
            {yearly && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                Poupe 2 meses
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            return (
              <AnimateOnScroll key={plan.name} delay={i * 100}>
                <div
                  className={`relative rounded-3xl p-[1px] transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-b from-indigo-500 to-violet-600 shadow-xl shadow-indigo-600/20"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 rounded-full shadow-lg">
                      Mais popular
                    </div>
                  )}
                  <div
                    className={`rounded-3xl p-8 h-full flex flex-col ${
                      plan.popular
                        ? "bg-white dark:bg-zinc-900"
                        : "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60"
                    }`}
                  >
                    <div className="mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-8">
                      {plan.monthlyPrice !== null ? (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">
                              {formatKz(yearly ? plan.yearlyPrice! : plan.monthlyPrice)}
                            </span>
                          </div>
                          <span className="text-sm text-zinc-400 mt-1 block">
                            /{yearly ? "ano" : "mês"} por escola
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold tracking-tight">Personalizado</div>
                          <span className="text-sm text-zinc-400 mt-1 block">
                            Contacte-nos para uma proposta
                          </span>
                        </>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              plan.popular
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-zinc-400 dark:text-zinc-500"
                            }`}
                          />
                          <span className="text-zinc-600 dark:text-zinc-400">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.ctaHref}
                      className={`group flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        plan.popular
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>

        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 mt-10">
          Todos os preços em Kwanzas angolanos (Kz). Pagamento via transferência bancária ou Multicaixa Express.
        </p>
      </div>
    </section>
  )
}
