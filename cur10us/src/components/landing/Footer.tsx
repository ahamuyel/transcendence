import Link from "next/link"
import { PlatformBranding } from "@/types/landing";
import type { LandingCopy } from "./landing-i18n";

export default function Footer({ branding, copy }: { branding: PlatformBranding; copy: LandingCopy["footer"] }) {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="text-xl font-bold tracking-tight">
              {branding.name === "Cur10usX" ? (
                <>
                  Cur10us
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                    X
                  </span>
                </>
              ) : (
                branding.name
              )}
            </span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed max-w-xs">
              {branding.description || copy.fallbackDescription}
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-[13px]">
              {copy.platform}
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <a href="#funcionalidades" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  {copy.features}
                </a>
              </li>
              <li>
                <a href="#para-quem" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  {copy.profiles}
                </a>
              </li>
            </ul>
          </div>

          {/* Acesso */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-[13px]">
              {copy.access}
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/signin" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  {copy.signIn}
                </Link>
              </li>
              <li>
                <Link href="/registar-escola" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  {copy.registerSchool}
                </Link>
              </li>
              <li>
                <Link href="/aplicacao" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  {copy.apply}
                </Link>
              </li>
              <li>
                <Link href="/aplicacao/status" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  {copy.trackApplication}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-[13px]">
              {copy.contact}
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <li>{branding.contactEmail || "suporte@cur10usx.com"}</li>
              {branding.contactPhone && <li>{branding.contactPhone}</li>}
              <li>{copy.location}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} {branding.name}. {copy.rights}
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-400 dark:text-zinc-500">
            <Link href="/termos" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              {copy.terms}
            </Link>
            <Link href="/privacidade" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              {copy.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
