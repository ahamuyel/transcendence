"use client"

import Link from "next/link"
import { useSchoolBranding } from "@/provider/school-branding"
import { useTranslation } from "@/lib/i18n"

export default function DashboardFooter() {
  const { footerText, contactEmail } = useSchoolBranding()
  const { tUI } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center sm:text-left">
            {footerText ? (
              <span>{footerText}</span>
            ) : (
              <span>&copy; {year} Cur10usX. {tUI("Todos os direitos reservados.")}</span>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
            <Link
              href="/termos"
              className="hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            >
              {tUI("Termos")}
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
            <Link
              href="/privacidade"
              className="hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            >
              {tUI("Privacidade")}
            </Link>
            {contactEmail && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                >
                  {contactEmail}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
