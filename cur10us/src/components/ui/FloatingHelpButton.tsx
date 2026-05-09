"use client"

import Link from "next/link"
import { HelpCircle } from "lucide-react"
import { usePathname } from "next/navigation"

export default function FloatingHelpButton() {
  const pathname = usePathname()

  // Don't show on the help page itself
  if (pathname === "/help") return null

  return (
    <Link
      href="/help"
      className="fixed bottom-24 md:bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center"
      title="Ajuda"
    >
      <HelpCircle size={22} />
    </Link>
  )
}
