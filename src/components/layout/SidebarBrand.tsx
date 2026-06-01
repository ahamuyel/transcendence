"use client"

import Link from "next/link"
import Image from "next/image"
import { useSchoolBranding } from "@/provider/school-branding"

const SidebarBrand = () => {
  const { name, logo } = useSchoolBranding()

  return (
    <div className="p-4">
      <Link href="/dashboard" className="flex items-center justify-center lg:justify-start gap-2">
        {logo ? (
          <Image src={logo} alt={name || "Logo"} width={32} height={32} className="w-8 h-8 rounded-lg object-contain shrink-0" />
        ) : (
          <span className="font-bold text-zinc-900 dark:text-zinc-100 lg:hidden text-lg">
            C<span style={{ color: "var(--school-primary)" }}>X</span>
          </span>
        )}
        <span className="font-bold text-zinc-900 dark:text-zinc-100 hidden lg:inline text-sm leading-tight truncate">
          {name || <>Cur10us<span style={{ color: "var(--school-primary)" }}>X</span></>}
        </span>
      </Link>
    </div>
  )
}

export default SidebarBrand
