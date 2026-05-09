import { FileText, Clock, Settings, Rocket } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

const steps = [
  {
    icon: FileText,
    step: "1",
    title: "Registe a sua escola",
    description: "Preencha o formulário com os dados da escola e submeta a candidatura.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Clock,
    step: "2",
    title: "Aguarde aprovação",
    description: "A nossa equipa analisa o pedido e aprova a sua escola na plataforma.",
    color: "from-violet-500 to-violet-600",
  },
  {
    icon: Settings,
    step: "3",
    title: "Configure o sistema",
    description: "Adicione turmas, professores e alunos. Personalize as funcionalidades.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Rocket,
    step: "4",
    title: "Comece a gerir",
    description: "Tudo pronto! Use os dashboards para acompanhar o dia-a-dia da escola.",
    color: "from-emerald-500 to-emerald-600",
  },
]

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-28 px-6 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            Simples e rápido
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
            Como{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              funciona
            </span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Em 4 passos simples, a sua escola está pronta para usar o Cur10usX.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-indigo-300 via-violet-300 to-emerald-300 dark:from-indigo-800 dark:via-violet-800 dark:to-emerald-800 rounded-full" />

          {steps.map((item, i) => {
            const Icon = item.icon
            return (
              <AnimateOnScroll key={item.step} delay={i * 120}>
                <div className="relative text-center group">
                  {/* Step number + icon */}
                  <div className="relative inline-flex mb-6">
                    <div className={`w-[72px] h-[72px] rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 z-20 shadow-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
