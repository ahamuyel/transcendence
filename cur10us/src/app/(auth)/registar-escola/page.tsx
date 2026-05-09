"use client"

import Link from "next/link"
import { Eye, EyeOff, School, Loader2 } from "lucide-react"
import { useState } from "react"
import { registerSchoolSchema } from "@/lib/validations/register-school"
import { csrfPost } from "@/lib/csrf-client"

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
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
            <School className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Registo enviado!</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            A sua escola foi registada com sucesso e está pendente de análise pela equipa Cur10usX.
            Receberá um e-mail quando a escola for aprovada e activada.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Enquanto isso, pode fazer login para acompanhar o estado da sua escola.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
  const labelClass = "block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300"

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-xl mx-auto">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Registe a sua escola</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Preencha os dados do administrador e da escola
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Admin section */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">1</span>
              Dados do administrador
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="adminName" className={labelClass}>Nome completo</label>
                <input id="adminName" type="text" placeholder="Seu nome" value={adminName} onChange={(e) => setAdminName(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div>
                <label htmlFor="adminEmail" className={labelClass}>E-mail pessoal</label>
                <input id="adminEmail" type="email" placeholder="seu@email.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div>
                <label htmlFor="adminPassword" className={labelClass}>Palavra-passe</label>
                <div className="relative">
                  <input id="adminPassword" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} disabled={loading} className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* School section */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">2</span>
              Dados da escola
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="schoolName" className={labelClass}>Nome da escola</label>
                <input id="schoolName" type="text" placeholder="Colégio Exemplo" value={schoolName} onChange={(e) => handleSchoolNameChange(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div>
                <label htmlFor="slug" className={labelClass}>Slug (identificador único)</label>
                <input id="slug" type="text" placeholder="colegio-exemplo" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={loading} className={inputClass} />
                <p className="text-xs text-zinc-400 mt-1">Gerado automaticamente a partir do nome</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nif" className={labelClass}>NIF <span className="text-zinc-400">(opcional)</span></label>
                  <input id="nif" type="text" placeholder="000000000" value={nif} onChange={(e) => setNif(e.target.value)} disabled={loading} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Telefone</label>
                  <input id="phone" type="text" placeholder="+244 900 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="schoolEmail" className={labelClass}>E-mail da escola</label>
                <input id="schoolEmail" type="email" placeholder="escola@exemplo.ao" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div>
                <label htmlFor="address" className={labelClass}>Endereço</label>
                <input id="address" type="text" placeholder="Rua, número, bairro" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>Cidade</label>
                  <input id="city" type="text" placeholder="Luanda" value={city} onChange={(e) => setCity(e.target.value)} disabled={loading} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="provincia" className={labelClass}>Província</label>
                  <select id="provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)} disabled={loading} className={inputClass}>
                    <option value="">Seleccione...</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <School className="w-4 h-4" />}
            {loading ? "Registando..." : "Registar escola"}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        Já tem uma conta?{" "}
        <Link href="/signin" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Entrar
        </Link>
        {" · "}
        <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Criar conta pessoal
        </Link>
      </p>
    </div>
  )
}
