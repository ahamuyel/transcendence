"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { ChevronDown, BookOpen, HelpCircle, Mail, LifeBuoy } from "lucide-react"
import { helpContent, contactInfo } from "@/lib/help-content"
import type { HelpSection } from "@/lib/help-content"

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
      >
        <span>{question}</span>
        <ChevronDown size={16} className={`shrink-0 ml-2 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

function FaqSection({ section }: { section: HelpSection }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">{section.title}</h3>
      <div className="flex flex-col gap-2">
        {section.items.map((item, i) => (
          <AccordionItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  )
}

export default function HelpPage() {
  const { data: session } = useSession()
  const role = session?.user?.role || "student"
  const content = helpContent[role] || helpContent.student

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <HelpCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Centro de Ajuda</h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">{content.welcome}</p>
          </div>
        </div>
      </div>

      {/* Guides */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Guias Passo a Passo</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {content.guides.map((guide, i) => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">{guide.title}</h3>
              <ol className="space-y-2">
                {guide.steps.map((step, j) => (
                  <li key={j} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                      {j + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Perguntas Frequentes</h2>
        </div>
        <div className="flex flex-col gap-6">
          {content.faq.map((section, i) => (
            <FaqSection key={i} section={section} />
          ))}
        </div>
      </div>

      {/* Support link */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <LifeBuoy size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Precisa de mais ajuda?</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          Abra um ticket de suporte e a nossa equipa irá ajudá-lo o mais rápido possível.
        </p>
        <Link
          href="/support"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <LifeBuoy size={14} />
          Ir para o Suporte
        </Link>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Mail size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Contacto</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{contactInfo.message}</p>
        <a
          href={`mailto:${contactInfo.email}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <Mail size={14} />
          {contactInfo.email}
        </a>
      </div>
    </div>
  )
}
