"use client"

import Link from "next/link"
import { Eye, EyeOff, School, Loader2, ArrowRight, ShieldCheck, Building2, User } from "lucide-react"
import { useState } from "react"
import { registerSchoolSchema } from "@/lib/validations/register-school"
import { csrfPost } from "@/lib/csrf-client"
import {
  AuthCard,
  AlertBanner,
} from "@/components/auth"

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire",
]

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function RegistarEscolaPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")

  const [schoolName, setSchoolName] = useState("")
  const [slug, setSlug] = useState("")
  const [nif, setNif] = useState("")
  const [schoolEmail, setSchoolEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [provincia, setProvincia] = useState("")

  function handleSchoolNameChange(value: string) {
    setSchoolName(value)
    setSlug(toSlug(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!acceptedTerms) {
      setError("Deve aceitar os Termos de Serviço e a Política de Privacidade")
      return
    }
    const parsed = registerSchoolSchema.safeParse({
      adminName, adminEmail, adminPassword,
      schoolName, slug, nif, schoolEmail, phone, address, city, provincia,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setLoading(true)
    try {
      const res = await csrfPost("/api/auth/register-school", parsed.data)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao registar escola")
        return
      }
      setSuccess(true)
    } catch {
      setError("Erro de conexão. Verifique a sua internet e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <AuthCard>
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-6">
              <School className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Registo enviado!
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              A escola{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {schoolName}
              </span>{" "}
              foi registada com sucesso e está pendente de análise pela equipa
              Cur10usX.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Receberá um e-mail quando a escola for aprovada e activada.
              Entretanto, pode fazer login para acompanhar o estado.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-sm transition"
            >
              Ir para o login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AuthCard>
      </div>
    )
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-50"
  const labelClass =
    "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-xl mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Registar escola
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Preencha os dados abaixo para registar a sua instituição na
              plataforma
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {error && <AlertBanner variant="error">{error}</AlertBanner>}

            {/* Admin section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center">
                  <User size={14} className="text-primary dark:text-primary-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Dados do administrador
                </h2>
              </div>

              <div>
                <label htmlFor="adminName" className={labelClass}>
                  Nome completo
                </label>
                <input
                  id="adminName"
                  type="text"
                  placeholder="O seu nome"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="adminEmail" className={labelClass}>
                  E-mail pessoal
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="adminPassword" className={labelClass}>
                  Palavra-passe
                </label>
                <div className="relative">
                  <input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={loading}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition p-1"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* School section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center">
                  <Building2 size={14} className="text-primary dark:text-primary-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Dados da escola
                </h2>
              </div>

              <div>
                <label htmlFor="schoolName" className={labelClass}>
                  Nome da escola
                </label>
                <input
                  id="schoolName"
                  type="text"
                  placeholder="Colégio Exemplo"
                  value={schoolName}
                  onChange={(e) => handleSchoolNameChange(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="slug" className={labelClass}>
                  Slug (identificador único)
                </label>
                <input
                  id="slug"
                  type="text"
                  placeholder="colegio-exemplo"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Gerado automaticamente a partir do nome
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nif" className={labelClass}>
                    NIF <span className="text-zinc-400">(opcional)</span>
                  </label>
                  <input
                    id="nif"
                    type="text"
                    placeholder="000000000"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Telefone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+244 900 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="schoolEmail" className={labelClass}>
                  E-mail da escola
                </label>
                <input
                  id="schoolEmail"
                  type="email"
                  placeholder="escola@exemplo.ao"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="address" className={labelClass}>
                  Endereço
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="Rua, número, bairro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    Cidade
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Luanda"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="provincia" className={labelClass}>
                    Província
                  </label>
                  <select
                    id="provincia"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  >
                    <option value="">Seleccione...</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <label
                htmlFor="terms"
                className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"
              >
                Li e aceito os{" "}
                <Link
                  href="/termos"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  Termos de Serviço
                </Link>{" "}
                e a{" "}
                <Link
                  href="/privacidade"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registando...
                </>
              ) : (
                <>
                  Registar escola
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Trust signal */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 -mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Os seus dados estão protegidos com encriptação</span>
            </div>
          </form>
        </div>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        Já tem uma conta?{" "}
        <Link href="/signin" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
        {" · "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Criar conta pessoal
        </Link>
      </p>
    </div>
  )
}
