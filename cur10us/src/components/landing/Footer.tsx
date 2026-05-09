import Link from "next/link"
import { PlatformBranding } from "@/types/landing";

export default function Footer({ branding }: { branding: PlatformBranding }) {
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
              {branding.description || "Plataforma de gestão escolar moderna, pensada para o contexto angolano."}
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-[13px]">
              Plataforma
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <a href="#funcionalidades" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#para-quem" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  Para quem
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  Perguntas frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Acesso */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-[13px]">
              Acesso
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/signin" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/registar-escola" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  Registar escola
                </Link>
              </li>
              <li>
                <Link href="/aplicacao" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  Solicitar matrícula
                </Link>
              </li>
              <li>
                <Link href="/aplicacao/status" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                  Acompanhar candidatura
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-[13px]">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <li>{branding.contactEmail || "suporte@cur10usx.com"}</li>
              {branding.contactPhone && <li>{branding.contactPhone}</li>}
              <li>Luanda, Angola</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} {branding.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-400 dark:text-zinc-500">
            <Link href="/termos" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
