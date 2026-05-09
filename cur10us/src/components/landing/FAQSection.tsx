"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "O Cur10usX é gratuito?",
    answer: "A plataforma está actualmente em fase de lançamento. Contacte-nos para saber mais sobre os planos disponíveis.",
  },
  {
    question: "Como registo a minha escola?",
    answer: "Clique em \"Registar escola\" e preencha o formulário com os dados da instituição. A nossa equipa irá analisar e aprovar o pedido em até 48 horas.",
  },
  {
    question: "Que informações preciso para o registo?",
    answer: "Nome da escola, NIF, e-mail, telefone, endereço, cidade e província. Após aprovação, receberá as credenciais de acesso por e-mail.",
  },
  {
    question: "Funciona em telemóveis?",
    answer: "Sim! O Cur10usX é totalmente responsivo e funciona em qualquer dispositivo com browser — computador, tablet ou telemóvel.",
  },
  {
    question: "Os dados da minha escola estão seguros?",
    answer: "Sim. Utilizamos encriptação, autenticação segura e cada escola tem os seus dados completamente isolados das demais.",
  },
  {
    question: "Posso personalizar as funcionalidades da minha escola?",
    answer: "Sim. O administrador da plataforma pode activar ou desactivar módulos conforme as necessidades de cada escola.",
  },
  {
    question: "Como funciona o processo de matrícula online?",
    answer: "Os candidatos preenchem um formulário público, recebem um código de acompanhamento, e o administrador da escola gere as candidaturas diretamente na plataforma.",
  },
  {
    question: "Posso importar alunos e professores em massa?",
    answer: "Sim. A plataforma suporta importação via ficheiro Excel/CSV com validação prévia dos dados antes da inserção.",
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-[50%] -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            <HelpCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            Tire as suas dúvidas
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
            Perguntas{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              frequentes
            </span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o Cur10usX.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-zinc-900 shadow-lg shadow-indigo-100/50 dark:shadow-black/20"
                    : "border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 transition group"
                >
                  <span className="pr-4">{faq.question}</span>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-indigo-100 dark:bg-indigo-950 rotate-180"
                        : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                    }`}
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-colors ${
                        isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"
                      }`}
                    />
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
