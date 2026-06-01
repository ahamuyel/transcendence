"use client"

import { useSchoolBranding } from "@/provider/school-branding"

export default function DashboardFooter() {
  const { footerText, contactEmail } = useSchoolBranding()

  if (!footerText && !contactEmail) return null

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
        {footerText ? (
          <span>{footerText}</span>
        ) : (
          <span>&copy; {new Date().getFullYear()} Cur10usX. Todos os direitos reservados.</span>
        )}
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className="hover:text-zinc-600 dark:hover:text-zinc-300 transition">
            {contactEmail}
          </a>
        )}
      </div>
    </footer>
  )
}
