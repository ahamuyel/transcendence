"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Moon, Sun, Bell, Shield, Globe, Settings2 } from "lucide-react"
import { useTheme } from "@/provider/theme"

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme()
  const { data: session, status } = useSession()
  const darkMode = theme === "dark"
  const [notifications, setNotifications] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(false)
  const [locale, setLocale] = useState("pt")
  const [saving, setSaving] = useState(false)

  // Só carrega preferências quando a sessão está activa
  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/user-preferences")
      .then((r) => r.ok ? r.json() : null)
      .then((pref) => {
        if (pref) {
          setNotifications(pref.notifyPlatform ?? true)
          setEmailNotifs(pref.notifyEmail ?? false)
          setLocale(pref.locale ?? "pt")
        }
      })
      .catch(() => {})
  }, [status])

  const savePref = async (updates: Record<string, unknown>) => {
    setSaving(true)
    await fetch("/api/user-preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {})
    setSaving(false)
  }

  const isAdmin = session?.user?.role === "school_admin"

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Configurações</h1>
        <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gerencie suas preferências</p>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
            {darkMode ? <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" /> : <Sun className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
          </div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Aparência</h2>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Modo escuro</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Alternar entre tema claro e escuro</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Idioma</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Idioma da interface</p>
            </div>
          </div>
          <select
            value={locale}
            onChange={(e) => { setLocale(e.target.value); savePref({ locale: e.target.value }) }}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Notificações</h2>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Notificações na plataforma</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Receba alertas em tempo real</p>
          </div>
          <button
            onClick={() => { const v = !notifications; setNotifications(v); savePref({ notifyPlatform: v }) }}
            className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Notificações por e-mail</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Resumo diário por e-mail</p>
          </div>
          <button
            onClick={() => { const v = !emailNotifs; setEmailNotifs(v); savePref({ notifyEmail: v }) }}
            className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifs ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${emailNotifs ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      {/* School Settings (admin only) */}
      {isAdmin && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Escola</h2>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Personalizar escola</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Logo, cor primária e identidade visual</p>
            </div>
            <Link
              href="/settings/school"
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Configurar
            </Link>
          </div>
        </div>
      )}

      {/* Security */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Segurança</h2>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Alterar senha</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Atualize sua senha de acesso</p>
          </div>
          <Link href="/change-password" className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
            Alterar
          </Link>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Sessões ativas</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerencie dispositivos conectados</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
            Gerenciar
          </button>
        </div>
      </div>

      {saving && <span className="text-xs text-zinc-400 text-center">Guardando...</span>}
    </div>
  )
}

export default SettingsPage